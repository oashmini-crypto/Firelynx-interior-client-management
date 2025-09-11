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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
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

// Helper function to generate preview for images (consistent with milestones)
async function generatePreview(filePath, fileName, fileType) {
  try {
    const ext = path.extname(fileName).toLowerCase();
    
    // For images - create preview
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
      const previewDir = 'uploads/previews/';
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
      
      return `/uploads/previews/${previewFileName}`;
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

// GET /api/files/project/:projectId - Get all files for project (includes milestone files)
router.get('/project/:projectId', async (req, res) => {
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
    
    const generalFiles = await db
      .select({
        id: fileAssets.id,
        projectId: fileAssets.projectId,
        milestoneId: fileAssets.milestoneId,
        ticketId: fileAssets.ticketId,
        filename: fileAssets.filename,
        originalName: fileAssets.originalName,
        url: fileAssets.url,
        previewUrl: fileAssets.previewUrl, // Use actual previewUrl field
        contentType: fileAssets.contentType,
        size: fileAssets.size,
        visibility: fileAssets.visibility,
        createdAt: fileAssets.createdAt,
        uploadedByName: users.name,
        uploadedByEmail: users.email,
        source: 'fileAssets'
      })
      .from(fileAssets)
      .leftJoin(users, eq(fileAssets.uploadedByUserId, users.id))
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
    
    const milestoneFilesList = await db
      .select({
        id: milestoneFiles.id,
        projectId: milestoneFiles.projectId,
        milestoneId: milestoneFiles.milestoneId,
        ticketId: null, // Not applicable for milestone files
        filename: milestoneFiles.fileName,
        originalName: milestoneFiles.fileName,
        url: milestoneFiles.storageUrl,
        previewUrl: milestoneFiles.previewUrl,
        contentType: milestoneFiles.fileType,
        size: milestoneFiles.size,
        visibility: milestoneFiles.visibility,
        createdAt: milestoneFiles.createdAt,
        uploadedByName: users.name,
        uploadedByEmail: users.email,
        source: 'milestoneFiles'
      })
      .from(milestoneFiles)
      .leftJoin(users, eq(milestoneFiles.uploadedBy, users.id))
      .where(milestoneFilesWhere);

    // Combine and sort all files
    const allFiles = [...generalFiles, ...milestoneFilesList]
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
router.get('/milestone/:milestoneId', async (req, res) => {
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

    const generalMilestoneFiles = await db
      .select({
        id: fileAssets.id,
        projectId: fileAssets.projectId,
        milestoneId: fileAssets.milestoneId,
        filename: fileAssets.filename,
        originalName: fileAssets.originalName,
        url: fileAssets.url,
        previewUrl: fileAssets.previewUrl,
        contentType: fileAssets.contentType,
        size: fileAssets.size,
        visibility: fileAssets.visibility,
        createdAt: fileAssets.createdAt,
        uploadedByName: users.name,
        source: 'fileAssets'
      })
      .from(fileAssets)
      .leftJoin(users, eq(fileAssets.uploadedByUserId, users.id))
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

    const specificMilestoneFiles = await db
      .select({
        id: milestoneFiles.id,
        projectId: milestoneFiles.projectId,
        milestoneId: milestoneFiles.milestoneId,
        filename: milestoneFiles.fileName,
        originalName: milestoneFiles.fileName,
        url: milestoneFiles.storageUrl,
        previewUrl: milestoneFiles.previewUrl,
        contentType: milestoneFiles.fileType,
        size: milestoneFiles.size,
        visibility: milestoneFiles.visibility,
        createdAt: milestoneFiles.createdAt,
        uploadedByName: users.name,
        source: 'milestoneFiles'
      })
      .from(milestoneFiles)
      .leftJoin(users, eq(milestoneFiles.uploadedBy, users.id))
      .where(milestoneFilesWhere);

    // Combine and sort files
    const allMilestoneFiles = [...generalMilestoneFiles, ...specificMilestoneFiles]
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

// POST /api/files/upload - Upload files
router.post('/upload', upload.array('files', 10), async (req, res) => {
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
      uploadedByUserId,
      visibility = 'Client'
    } = req.body;
    
    if (!projectId || !uploadedByUserId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, uploadedByUserId'
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
        // Generate preview for images
        const previewUrl = await generatePreview(file.path, file.originalname, file.mimetype);
        
        // Get actual file size
        const fileSize = await getFileSize(file.path);
        
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
            url: `/uploads/${file.filename}`,
            previewUrl: previewUrl, // Store the actual generated previewUrl
            contentType: file.mimetype,
            size: fileSize,
            visibility: normalizedVisibility
          })
          .returning();
        
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
router.put('/:fileId/visibility', async (req, res) => {
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
router.delete('/:fileId', async (req, res) => {
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

// GET /api/files/:fileId/download - Download file with proper headers
router.get('/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    
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
    const filePath = path.join('.', file.url);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }
    
    // Set proper headers for download
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size);
    
    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// GET /api/files/stats/:projectId - Get file statistics for project
router.get('/stats/:projectId', async (req, res) => {
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