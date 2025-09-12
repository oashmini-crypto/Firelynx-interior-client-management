// Tenant Settings API Routes
// Per-tenant configuration management for multi-tenant SaaS

const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { db, tenants } = require('../database');
const { eq, sql, and, ne } = require('drizzle-orm');
const { authenticateToken } = require('../middleware/auth');

// SECURITY: Path validation functions to prevent directory traversal attacks
const validateTenantPath = (tenantId, filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    return { isValid: false, error: 'Invalid file path' };
  }
  
  // Normalize the path to prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  
  // Check if path tries to escape using .. or absolute paths
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
    return { isValid: false, error: 'Path traversal attempt detected' };
  }
  
  // Ensure path starts with the expected tenant directory structure
  const expectedPrefix = `uploads/tenants/${tenantId}/logos/`;
  if (!normalizedPath.startsWith(expectedPrefix)) {
    return { isValid: false, error: 'Path outside tenant directory' };
  }
  
  // Additional validation: ensure no null bytes or other suspicious characters
  if (normalizedPath.includes('\0') || normalizedPath.includes('%00')) {
    return { isValid: false, error: 'Invalid characters in path' };
  }
  
  return { isValid: true, safePath: normalizedPath };
};

const safeDeleteTenantFile = async (tenantId, filePath) => {
  const validation = validateTenantPath(tenantId, filePath);
  if (!validation.isValid) {
    console.warn(`Unsafe file deletion attempt: ${validation.error} for path: ${filePath}`);
    return false;
  }
  
  try {
    const fullPath = path.resolve('.', validation.safePath);
    // Double-check the resolved path is still within tenant directory
    const tenantDir = path.resolve('.', `uploads/tenants/${tenantId}/logos`);
    const relativePath = path.relative(tenantDir, fullPath);
    
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      console.warn(`Resolved path outside tenant directory: ${fullPath}`);
      return false;
    }
    
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting tenant file:', error);
    }
    return false;
  }
};

// All tenant routes require authentication
router.use(authenticateToken);

// Logo upload configuration for tenant-specific logos
const tenantLogoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const logoDir = `uploads/tenants/${req.user.tenantId}/logos/`;
    try {
      await fs.access(logoDir);
    } catch {
      await fs.mkdir(logoDir, { recursive: true });
    }
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-logo' + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const tenantLogoUpload = multer({
  storage: tenantLogoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for tenant logos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid logo file type. Only JPEG, PNG, and SVG allowed.'));
    }
  }
});

// GET /api/tenant/settings - Get current tenant settings
router.get('/settings', async (req, res) => {
  try {
    console.log('🔍 Tenant settings endpoint called');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.user.tenantId:', req.user?.tenantId);
    
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required - tenant ID not found'
      });
    }
    
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, req.user.tenantId))
      .limit(1);
    
    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenantData = tenant[0];
    
    // Parse settings JSON, provide defaults if empty
    const settings = tenantData.settings || {};
    
    res.json({
      success: true,
      data: {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug,
        subdomain: tenantData.subdomain,
        customDomain: tenantData.customDomain,
        status: tenantData.status,
        settings: {
          logo: settings.logo || null,
          primaryColor: settings.primaryColor || '#4C6FFF',
          description: settings.description || '',
          contactEmail: settings.contactEmail || '',
          contactPhone: settings.contactPhone || '',
          address: settings.address || '',
          website: settings.website || '',
          timezone: settings.timezone || 'UTC',
          ...settings
        },
        createdAt: tenantData.createdAt,
        updatedAt: tenantData.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenant settings'
    });
  }
});

// PUT /api/tenant/settings - Update tenant settings
router.put('/settings', async (req, res) => {
  try {
    const {
      name,
      subdomain,
      description,
      contactEmail,
      contactPhone,
      address,
      website,
      timezone,
      primaryColor,
      customSettings
    } = req.body;

    // Validate primary color if provided
    if (primaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid primary color format. Use hex format #RRGGBB or #RGB'
      });
    }

    // Validate subdomain if provided
    if (subdomain !== undefined) {
      if (subdomain === null || subdomain === '') {
        // Allow clearing subdomain
      } else {
        // Validate subdomain format: alphanumeric and hyphens, 3-63 characters
        if (!/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(subdomain)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid subdomain format. Use 3-63 characters: lowercase letters, numbers, and hyphens (cannot start/end with hyphen)'
          });
        }
        
        // Check reserved subdomains
        const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'cdn', 'static', 'assets'];
        if (reserved.includes(subdomain.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: 'Subdomain is reserved. Please choose a different one.'
          });
        }
        
        // Check if subdomain is already taken by another tenant
        const existingTenant = await db
          .select()
          .from(tenants)
          .where(and(
            eq(tenants.subdomain, subdomain),
            ne(tenants.id, req.user.tenantId)
          ))
          .limit(1);
        
        if (existingTenant.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Subdomain is already taken. Please choose a different one.'
          });
        }
      }
    }

    // Get current tenant data
    const currentTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, req.user.tenantId))
      .limit(1);

    if (currentTenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const existingSettings = currentTenant[0].settings || {};

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    // Update tenant name if provided
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    
    // Update subdomain if provided
    if (subdomain !== undefined) {
      updateData.subdomain = subdomain;
    }

    // Update settings JSON
    const newSettings = {
      ...existingSettings,
      ...(description !== undefined && { description }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(contactPhone !== undefined && { contactPhone }),
      ...(address !== undefined && { address }),
      ...(website !== undefined && { website }),
      ...(timezone !== undefined && { timezone }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(customSettings && { ...customSettings })
    };

    updateData.settings = newSettings;

    // Update tenant
    const updatedTenant = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, req.user.tenantId))
      .returning();

    res.json({
      success: true,
      data: {
        ...updatedTenant[0],
        settings: newSettings
      },
      message: 'Tenant settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant settings'
    });
  }
});

// POST /api/tenant/logo - Upload tenant logo
router.post('/logo', tenantLogoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No logo file provided'
      });
    }

    let logoUrl = `/uploads/tenants/${req.user.tenantId}/logos/${req.file.filename}`;
    
    // Optimize image if it's not SVG
    if (req.file.mimetype !== 'image/svg+xml') {
      const optimizedFilename = 'optimized-' + req.file.filename;
      const optimizedPath = path.join(`uploads/tenants/${req.user.tenantId}/logos`, optimizedFilename);
      
      await sharp(req.file.path)
        .resize(400, 200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toFile(optimizedPath);
      
      // Remove original file and use optimized version
      await fs.unlink(req.file.path);
      logoUrl = `/uploads/tenants/${req.user.tenantId}/logos/${optimizedFilename}`;
    }

    // Get current tenant settings
    const currentTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, req.user.tenantId))
      .limit(1);

    if (currentTenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const existingSettings = currentTenant[0].settings || {};

    // Remove old logo file if exists (using secure deletion)
    if (existingSettings.logo) {
      const deleted = await safeDeleteTenantFile(req.user.tenantId, existingSettings.logo);
      if (!deleted) {
        console.warn(`Could not safely delete old tenant logo: ${existingSettings.logo}`);
      }
    }

    // Update tenant settings with new logo URL
    const newSettings = {
      ...existingSettings,
      logo: logoUrl
    };

    const updatedTenant = await db
      .update(tenants)
      .set({
        settings: newSettings,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, req.user.tenantId))
      .returning();

    res.json({
      success: true,
      data: {
        logoUrl,
        tenant: {
          ...updatedTenant[0],
          settings: newSettings
        }
      },
      message: 'Tenant logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading tenant logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload tenant logo'
    });
  }
});

// DELETE /api/tenant/logo - Remove tenant logo
router.delete('/logo', async (req, res) => {
  try {
    // Get current tenant settings
    const currentTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, req.user.tenantId))
      .limit(1);

    if (currentTenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const existingSettings = currentTenant[0].settings || {};

    // Remove logo file if exists (using secure deletion)
    if (existingSettings.logo) {
      const deleted = await safeDeleteTenantFile(req.user.tenantId, existingSettings.logo);
      if (!deleted) {
        console.warn(`Could not safely delete tenant logo: ${existingSettings.logo}`);
      }
    }

    // Update tenant settings to remove logo
    const newSettings = {
      ...existingSettings,
      logo: null
    };

    const updatedTenant = await db
      .update(tenants)
      .set({
        settings: newSettings,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, req.user.tenantId))
      .returning();

    res.json({
      success: true,
      data: {
        ...updatedTenant[0],
        settings: newSettings
      },
      message: 'Tenant logo removed successfully'
    });
  } catch (error) {
    console.error('Error removing tenant logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove tenant logo'
    });
  }
});

// GET /api/tenant/logo/:filename - Securely serve tenant logos
router.get('/logo/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename || !/^[a-zA-Z0-9_-]+\.[a-zA-Z]{2,5}$/.test(filename)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename format'
      });
    }
    
    // Construct safe path within tenant directory
    const logoPath = `uploads/tenants/${req.user.tenantId}/logos/${filename}`;
    const validation = validateTenantPath(req.user.tenantId, logoPath);
    
    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    try {
      const fullPath = path.resolve('.', validation.safePath);
      await fs.access(fullPath, fs.constants.R_OK);
      
      // Set appropriate headers for image serving
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      
      // Stream the file
      const fileStream = require('fs').createReadStream(fullPath);
      fileStream.pipe(res);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Logo not found'
        });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error serving tenant logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve logo'
    });
  }
});

module.exports = router;