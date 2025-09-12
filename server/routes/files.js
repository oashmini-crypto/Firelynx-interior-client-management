// File Management API Routes
// Upload with visibility toggle and proper storage

const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { db, fileAssets, users, milestoneFiles } = require('../database');
const { eq, and, desc } = require('drizzle-orm');
const { authenticateToken, requireStaff } = require('../middleware/auth');

// Configure multer for tenant-segregated file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // SECURITY: Create tenant-specific upload directories
    const tenantId = req.tenantId || req.tenant?.id;
    if (!tenantId) {
      return cb(new Error('Tenant context required for file upload'), null);
    }
    
    const uploadDir = `uploads/tenant-${tenantId}/`;
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating tenant upload directory:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'files-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ];
    
    const allowedExtensions = ['.dwg', '.dxf', '.skp', '.3ds', '.max'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Helper function to generate preview for images (tenant-aware)
async function generatePreview(filePath, fileName, fileType, tenantId) {
  try {
    const ext = path.extname(fileName).toLowerCase();
    
    // For images - create preview in tenant-specific directory
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
      const previewDir = `uploads/tenant-${tenantId}/previews/`;
      await fs.mkdir(previewDir, { recursive: true });
      
      const previewFileName = 'preview_' + fileName.replace(/\.[^/.]+$/, '.jpg');
      const previewPath = path.join(previewDir, previewFileName);
      
      await sharp(filePath)
        .resize(400, 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(previewPath);
      
      // Return secure API endpoint instead of direct file path
      return `/api/files/preview/${previewFileName}?tenant=${tenantId}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating preview:', error);
    return null;
  }
}

// Helper function to get file size
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}

// SECURITY: Add authentication to all file endpoints
// GET /api/files/project/:projectId - Get all files for project (includes milestone files)
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { visibility } = req.query;
    
    // Fetch files from fileAssets table
    let fileAssetsWhere = eq(fileAssets.projectId, projectId);
    if (visibility) {
      const normalizedVisibility = visibility.toLowerCase() === 'client' ? 'Client' : 'Internal';
      fileAssetsWhere = and(
        eq(fileAssets.projectId, projectId),
        eq(fileAssets.visibility, normalizedVisibility)
      );
    }
    
    // Simplified query to avoid infinite recursion
    const generalFiles = await db
      .select()
      .from(fileAssets)
      .where(fileAssetsWhere);

    // Fetch files from milestoneFiles table
    let milestoneFilesWhere = eq(milestoneFiles.projectId, projectId);
    if (visibility) {
      const normalizedVisibility = visibility.toLowerCase();
      milestoneFilesWhere = and(
        eq(milestoneFiles.projectId, projectId),
        eq(milestoneFiles.visibility, normalizedVisibility)
      );
    }
    
    // Simplified query to avoid infinite recursion
    const milestoneFilesList = await db
      .select()
      .from(milestoneFiles)
      .where(milestoneFilesWhere);

    // Transform and unify the data formats
    const transformedGeneralFiles = generalFiles.map(file => ({
      id: file.id,
      projectId: file.projectId,
      milestoneId: file.milestoneId,
      ticketId: file.ticketId,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      previewUrl: file.previewUrl,
      contentType: file.contentType,
      size: file.size,
      visibility: file.visibility,
      createdAt: file.createdAt,
      uploadedByName: 'System User',
      source: 'fileAssets'
    }));

    const transformedMilestoneFiles = milestoneFilesList.map(file => ({
      id: file.id,
      projectId: file.projectId,
      milestoneId: file.milestoneId,
      ticketId: null,
      filename: file.fileName,
      originalName: file.fileName,
      url: file.storageUrl,
      previewUrl: file.previewUrl,
      contentType: file.fileType,
      size: file.size,
      visibility: file.visibility,
      createdAt: file.createdAt,
      uploadedByName: 'System User',
      source: 'milestoneFiles'
    }));

    // Combine and sort all files
    const allFiles = [...transformedGeneralFiles, ...transformedMilestoneFiles]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: allFiles,
      count: allFiles.length
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project files'
    });
  }
});

// GET /api/files/milestone/:milestoneId - Get files for milestone (unified from both tables)
router.get('/milestone/:milestoneId', authenticateToken, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { visibility } = req.query;
    
    // Fetch from fileAssets table (general files associated with milestone)
    let fileAssetsWhere = eq(fileAssets.milestoneId, milestoneId);
    if (visibility) {
      const normalizedVisibility = visibility.toLowerCase() === 'client' ? 'Client' : 'Internal';
      fileAssetsWhere = and(
        eq(fileAssets.milestoneId, milestoneId),
        eq(fileAssets.visibility, normalizedVisibility)
      );
    }

    // Simplified query to avoid infinite recursion
    const generalMilestoneFiles = await db
      .select()
      .from(fileAssets)
      .where(fileAssetsWhere);

    // Fetch from milestoneFiles table (milestone-specific files)
    let milestoneFilesWhere = eq(milestoneFiles.milestoneId, milestoneId);
    if (visibility) {
      const normalizedVisibility = visibility.toLowerCase();
      milestoneFilesWhere = and(
        eq(milestoneFiles.milestoneId, milestoneId),
        eq(milestoneFiles.visibility, normalizedVisibility)
      );
    }

    // Simplified query to avoid infinite recursion
    const specificMilestoneFiles = await db
      .select()
      .from(milestoneFiles)
      .where(milestoneFilesWhere);

    // Transform and unify the data formats
    const transformedGeneralFiles = generalMilestoneFiles.map(file => ({
      id: file.id,
      projectId: file.projectId,
      milestoneId: file.milestoneId,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      previewUrl: file.previewUrl,
      contentType: file.contentType,
      size: file.size,
      visibility: file.visibility,
      createdAt: file.createdAt,
      uploadedByName: 'System User',
      source: 'fileAssets'
    }));

    const transformedSpecificFiles = specificMilestoneFiles.map(file => ({
      id: file.id,
      projectId: file.projectId,
      milestoneId: file.milestoneId,
      filename: file.fileName,
      originalName: file.fileName,
      url: file.storageUrl,
      previewUrl: file.previewUrl,
      contentType: file.fileType,
      size: file.size,
      visibility: file.visibility,
      createdAt: file.createdAt,
      uploadedByName: 'System User',
      source: 'milestoneFiles'
    }));

    // Combine and sort files
    const allMilestoneFiles = [...transformedGeneralFiles, ...transformedSpecificFiles]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: allMilestoneFiles,
      count: allMilestoneFiles.length
    });
  } catch (error) {
    console.error('Error fetching milestone files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestone files'
    });
  }
});

// POST /api/files/upload - Upload files (authenticated and tenant-aware)
router.post('/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    const {
      projectId,
      milestoneId,
      ticketId,
      uploadedByUserId = '8eeec650-d268-47a1-96f5-dd9571ec60aa', // Default to Project Manager (Bob Wilson)
      visibility = 'Client'
    } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: projectId'
      });
    }
    
    // Validate that the user ID exists in the database
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, uploadedByUserId))
      .limit(1);
      
    if (userExists.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uploadedByUserId: User does not exist'
      });
    }
    
    // Normalize and validate visibility (case-insensitive)
    const normalizedVisibility = visibility.charAt(0).toUpperCase() + visibility.slice(1).toLowerCase();
    if (!['Client', 'Internal'].includes(normalizedVisibility)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "Client" or "Internal" (case-insensitive)'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        // Generate preview for images (tenant-aware)
        const tenantId = req.tenantId || req.tenant?.id;
        const previewUrl = await generatePreview(file.path, file.originalname, file.mimetype, tenantId);
        
        // Get actual file size
        const fileSize = await getFileSize(file.path);
        
        // SECURITY: Store secure API endpoint URL instead of direct file path
        const secureFileUrl = `/api/files/${uuidv4()}/download`;
        const tenantFilePath = `uploads/tenant-${tenantId}/${file.filename}`;
        
        // Create file asset record (ID auto-generated by schema)
        const fileAsset = await db
          .insert(fileAssets)
          .values({
            projectId,
            milestoneId: milestoneId || null,
            ticketId: ticketId || null,
            uploadedByUserId,
            filename: file.filename,
            originalName: file.originalname,
            url: tenantFilePath, // Store tenant-specific file path for secure access
            previewUrl: previewUrl, // Store secure preview URL
            contentType: file.mimetype,
            size: fileSize,
            visibility: normalizedVisibility
          })
          .returning();
          
        // SECURITY: Log successful file upload
        console.log(`✅ File uploaded: ${file.originalname} | User: ${req.user.email} | Tenant: ${tenantId} | Size: ${fileSize} bytes`);
        
        uploadedFiles.push({
          ...fileAsset[0],
          previewUrl
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        // Continue with other files
      }
    }
    
    res.status(201).json({
      success: true,
      data: uploadedFiles,
      count: uploadedFiles.length,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

// PUT /api/files/:fileId/visibility - Update file visibility
router.put('/:fileId/visibility', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { visibility } = req.body;
    
    // Normalize and validate visibility (case-insensitive)
    const normalizedVisibility = visibility.charAt(0).toUpperCase() + visibility.slice(1).toLowerCase();
    if (!['Client', 'Internal'].includes(normalizedVisibility)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "Client" or "Internal" (case-insensitive)'
      });
    }
    
    const updatedFile = await db
      .update(fileAssets)
      .set({ visibility: normalizedVisibility })
      .where(eq(fileAssets.id, fileId))
      .returning();
    
    if (updatedFile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedFile[0],
      message: `File visibility updated to ${normalizedVisibility}`
    });
  } catch (error) {
    console.error('Error updating file visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file visibility'
    });
  }
});

// DELETE /api/files/:fileId - Delete file
router.delete('/:fileId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file details before deletion
    const fileDetails = await db
      .select()
      .from(fileAssets)
      .where(eq(fileAssets.id, fileId))
      .limit(1);
    
    if (fileDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const file = fileDetails[0];
    
    // Delete file from filesystem
    try {
      const filePath = path.join('.', file.url);
      await fs.unlink(filePath);
    } catch (fsError) {
      console.log('File not found on filesystem, continuing with database deletion...');
    }
    
    // Delete thumbnail if exists
    try {
      const thumbnailPath = file.url.replace('/uploads/', '/uploads/thumbnails/thumb_').replace(/\.[^/.]+$/, '.jpg');
      await fs.unlink(path.join('.', thumbnailPath));
    } catch (thumbnailError) {
      // Thumbnail may not exist, continue
    }
    
    // Delete from database
    await db
      .delete(fileAssets)
      .where(eq(fileAssets.id, fileId));
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

// GET /api/files/:fileId/download - Secure download with authentication and tenant validation
router.get('/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.userId;
    const userTenantId = req.user.tenantId;
    
    // SECURITY: Query file with tenant validation
    const fileDetails = await db
      .select()
      .from(fileAssets)
      .where(eq(fileAssets.id, fileId))
      .limit(1);
    
    if (fileDetails.length === 0) {
      // SECURITY: Log unauthorized file access attempt
      console.warn(`🚨 SECURITY: File access denied - File not found: ${fileId} | User: ${req.user.email} | Tenant: ${userTenantId}`);
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const file = fileDetails[0];
    
    // CRITICAL SECURITY: Validate tenant access to file
    // Note: Files are stored in tenant-specific directories, this adds database-level validation
    const expectedTenantPath = `uploads/tenant-${userTenantId}/`;
    if (!file.url.startsWith(`/${expectedTenantPath}`) && !file.url.startsWith(expectedTenantPath)) {
      console.error(`🚨 SECURITY VIOLATION: Cross-tenant file access attempt!`);
      console.error(`   User: ${req.user.email} (tenant: ${userTenantId})`);
      console.error(`   Attempted file: ${fileId} (${file.url})`);
      console.error(`   Expected tenant path: ${expectedTenantPath}`);
      
      return res.status(403).json({
        success: false,
        error: 'Access denied - insufficient permissions'
      });
    }
    
    // Construct secure file path
    const secureFilePath = file.url.startsWith('/') ? file.url.substring(1) : file.url;
    const fullPath = path.resolve(secureFilePath);
    
    // SECURITY: Validate file is within expected tenant directory
    const normalizedBasePath = path.resolve(`uploads/tenant-${userTenantId}`);
    if (!fullPath.startsWith(normalizedBasePath)) {
      console.error(`🚨 SECURITY VIOLATION: Path traversal attempt detected!`);
      console.error(`   User: ${req.user.email} | File: ${fileId} | Path: ${fullPath}`);
      
      return res.status(403).json({
        success: false,
        error: 'Access denied - invalid file path'
      });
    }
    
    // Check if file exists on filesystem
    try {
      await fs.access(fullPath);
    } catch (error) {
      console.warn(`⚠️ File missing from filesystem: ${fullPath} | File ID: ${fileId}`);
      return res.status(404).json({
        success: false,
        error: 'File not available'
      });
    }
    
    // SECURITY: Log successful file access
    console.log(`✅ File download: ${file.originalName} | User: ${req.user.email} | Tenant: ${userTenantId}`);
    
    // Set secure headers for download
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send file securely
    res.sendFile(fullPath);
  } catch (error) {
    console.error('❌ Secure file download error:', error);
    console.error(`   User: ${req.user?.email || 'unknown'} | File: ${req.params.fileId}`);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// GET /api/files/preview/:filename - Secure image preview endpoint
router.get('/preview/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { tenant } = req.query;
    const userTenantId = req.user.tenantId;
    
    // SECURITY: Validate tenant access 
    if (tenant !== userTenantId) {
      console.warn(`🚨 SECURITY: Unauthorized preview access | User: ${req.user.email} | Requested tenant: ${tenant} | User tenant: ${userTenantId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // SECURITY: Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error(`🚨 SECURITY: Path traversal attempt in preview | User: ${req.user.email} | Filename: ${filename}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    const previewPath = path.resolve(`uploads/tenant-${userTenantId}/previews/${filename}`);
    const basePath = path.resolve(`uploads/tenant-${userTenantId}/previews/`);
    
    // SECURITY: Ensure path is within tenant directory
    if (!previewPath.startsWith(basePath)) {
      console.error(`🚨 SECURITY: Path traversal attempt detected in preview | User: ${req.user.email} | Path: ${previewPath}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Check if preview file exists
    try {
      await fs.access(previewPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Preview not found'
      });
    }
    
    // SECURITY: Set secure headers for image preview
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send preview securely
    res.sendFile(previewPath);
    
  } catch (error) {
    console.error('❌ Secure preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load preview'
    });
  }
});

// GET /api/files/stats/:projectId - Get file statistics for project
router.get('/stats/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const stats = await db
      .select({
        visibility: fileAssets.visibility,
        count: sql`count(*)`,
        totalSize: sql`sum(${fileAssets.size})`
      })
      .from(fileAssets)
      .where(eq(fileAssets.projectId, projectId))
      .groupBy(fileAssets.visibility);
    
    const formattedStats = {
      total: 0,
      totalSize: 0,
      client: { count: 0, size: 0 },
      internal: { count: 0, size: 0 }
    };
    
    stats.forEach(stat => {
      const count = parseInt(stat.count);
      const size = parseInt(stat.totalSize) || 0;
      
      formattedStats.total += count;
      formattedStats.totalSize += size;
      
      if (stat.visibility === 'Client') {
        formattedStats.client = { count, size };
      } else if (stat.visibility === 'Internal') {
        formattedStats.internal = { count, size };
      }
    });
    
    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file statistics'
    });
  }
});

module.exports = router;