// Branding Settings API Routes
// Centralized branding controls for logo, colors, fonts, and PDF styling

const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { db, brandingSettings } = require('../database');
const { eq } = require('drizzle-orm');

// Logo upload configuration
const logoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const logoDir = 'uploads/branding/';
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

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for logos
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

// Helper function to get or create branding settings
async function getBrandingSettings() {
  try {
    const settings = await db
      .select()
      .from(brandingSettings)
      .limit(1);
    
    if (settings.length === 0) {
      // Create default branding settings
      const defaultSettings = await db
        .insert(brandingSettings)
        .values({
          appName: 'FireLynx',
          accentColor: '#4C6FFF',
          primaryTextColor: '#0F172A',
          mutedTextColor: '#64748B',
          borderColor: '#E2E8F0',
          bgSoft: '#F8FAFC',
          fontFamily: 'Inter, system-ui, Roboto, Helvetica, Arial',
          footerLeft: 'FireLynx Interior Design Studio',
          footerRight: 'support@firelynx.com • +1 (555) 123-4567',
          watermarkEnabled: false,
          watermarkText: 'DRAFT',
          watermarkOpacity: '0.08',
          pageSize: 'A4',
          pageMargins: '24mm 18mm 22mm 18mm'
        })
        .returning();
      
      return defaultSettings[0];
    }
    
    return settings[0];
  } catch (error) {
    console.error('Error getting branding settings:', error);
    throw error;
  }
}

// Validate color hex code
function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// GET /api/branding - Get current branding settings
router.get('/', async (req, res) => {
  try {
    const settings = await getBrandingSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branding settings'
    });
  }
});

// PUT /api/branding - Update branding settings
router.put('/', async (req, res) => {
  try {
    const {
      appName,
      accentColor,
      primaryTextColor,
      mutedTextColor,
      borderColor,
      bgSoft,
      fontFamily,
      footerLeft,
      footerRight,
      watermarkEnabled,
      watermarkText,
      watermarkOpacity,
      pageSize,
      pageMargins
    } = req.body;
    
    // Validate colors
    const colorsToValidate = {
      accentColor,
      primaryTextColor,
      mutedTextColor,
      borderColor,
      bgSoft
    };
    
    for (const [key, color] of Object.entries(colorsToValidate)) {
      if (color && !isValidHexColor(color)) {
        return res.status(400).json({
          success: false,
          error: `Invalid hex color for ${key}. Use format #RRGGBB or #RGB`
        });
      }
    }
    
    // Validate watermark opacity
    if (watermarkOpacity !== undefined) {
      const opacity = parseFloat(watermarkOpacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        return res.status(400).json({
          success: false,
          error: 'Watermark opacity must be a number between 0 and 1'
        });
      }
    }
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };
    
    if (appName) updateData.appName = appName;
    if (accentColor) updateData.accentColor = accentColor;
    if (primaryTextColor) updateData.primaryTextColor = primaryTextColor;
    if (mutedTextColor) updateData.mutedTextColor = mutedTextColor;
    if (borderColor) updateData.borderColor = borderColor;
    if (bgSoft) updateData.bgSoft = bgSoft;
    if (fontFamily) updateData.fontFamily = fontFamily;
    if (footerLeft) updateData.footerLeft = footerLeft;
    if (footerRight) updateData.footerRight = footerRight;
    if (typeof watermarkEnabled === 'boolean') updateData.watermarkEnabled = watermarkEnabled;
    if (watermarkText) updateData.watermarkText = watermarkText;
    if (watermarkOpacity !== undefined) updateData.watermarkOpacity = watermarkOpacity.toString();
    if (pageSize) updateData.pageSize = pageSize;
    if (pageMargins) updateData.pageMargins = pageMargins;
    
    // Get current settings to update
    const currentSettings = await getBrandingSettings();
    
    const updatedSettings = await db
      .update(brandingSettings)
      .set(updateData)
      .where(eq(brandingSettings.id, currentSettings.id))
      .returning();
    
    res.json({
      success: true,
      data: updatedSettings[0],
      message: 'Branding settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating branding settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branding settings'
    });
  }
});

// POST /api/branding/logo - Upload logo
router.post('/logo', logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No logo file provided'
      });
    }
    
    let logoUrl = `/uploads/branding/${req.file.filename}`;
    
    // Optimize image if it's not SVG
    if (req.file.mimetype !== 'image/svg+xml') {
      const optimizedFilename = 'optimized-' + req.file.filename;
      const optimizedPath = path.join('uploads/branding', optimizedFilename);
      
      await sharp(req.file.path)
        .resize(400, 200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toFile(optimizedPath);
      
      // Remove original file and use optimized version
      await fs.unlink(req.file.path);
      logoUrl = `/uploads/branding/${optimizedFilename}`;
    }
    
    // Update branding settings with new logo URL
    const currentSettings = await getBrandingSettings();
    
    // Remove old logo file if exists
    if (currentSettings.logoUrl) {
      try {
        const oldLogoPath = path.join('.', currentSettings.logoUrl);
        await fs.unlink(oldLogoPath);
      } catch (error) {
        console.log('Old logo file not found, continuing...');
      }
    }
    
    const updatedSettings = await db
      .update(brandingSettings)
      .set({
        logoUrl,
        updatedAt: new Date()
      })
      .where(eq(brandingSettings.id, currentSettings.id))
      .returning();
    
    res.json({
      success: true,
      data: {
        logoUrl,
        settings: updatedSettings[0]
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload logo'
    });
  }
});

// DELETE /api/branding/logo - Remove logo
router.delete('/logo', async (req, res) => {
  try {
    const currentSettings = await getBrandingSettings();
    
    if (currentSettings.logoUrl) {
      try {
        const logoPath = path.join('.', currentSettings.logoUrl);
        await fs.unlink(logoPath);
      } catch (error) {
        console.log('Logo file not found, continuing...');
      }
    }
    
    const updatedSettings = await db
      .update(brandingSettings)
      .set({
        logoUrl: null,
        updatedAt: new Date()
      })
      .where(eq(brandingSettings.id, currentSettings.id))
      .returning();
    
    res.json({
      success: true,
      data: updatedSettings[0],
      message: 'Logo removed successfully'
    });
  } catch (error) {
    console.error('Error removing logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove logo'
    });
  }
});

// GET /api/branding/preview - Get preview of branded document
router.get('/preview', async (req, res) => {
  try {
    const settings = await getBrandingSettings();
    const { type = 'invoice' } = req.query;
    
    // Return preview data for frontend to render
    res.json({
      success: true,
      data: {
        settings,
        preview: {
          type,
          sampleData: type === 'invoice' ? {
            number: 'INV-2025-0001',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: [
              { description: 'Design Consultation', quantity: 1, rate: 2500, taxPercent: 10 },
              { description: 'Material Procurement', quantity: 1, rate: 5000, taxPercent: 10 }
            ]
          } : {
            number: 'VR-2025-0001',
            changeRequestor: 'Client Name',
            changeArea: 'Living Room',
            workTypes: ['Joinery', 'Electrical'],
            categories: ['Scope', 'Quality']
          }
        }
      }
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview'
    });
  }
});

module.exports = router;