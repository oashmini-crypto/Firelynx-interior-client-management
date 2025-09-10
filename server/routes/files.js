// File Management API Routes
// Upload with visibility toggle and proper storage

const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { db, fileAssets, users } = require('../database');
const { eq, and, desc } = require('drizzle-orm');

// Helper function to generate thumbnail for images
async function generateThumbnail(filePath, filename) {
  try {
    const ext = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return null; // Not an image
    }
    
    const thumbnailDir = 'uploads/thumbnails/';
    await fs.mkdir(thumbnailDir, { recursive: true });
    
    const thumbnailFilename = 'thumb_' + filename.replace(/\.[^/.]+$/, '.jpg');
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    
    await sharp(filePath)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);
    
    return `/uploads/thumbnails/${thumbnailFilename}`;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
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

// GET /api/files/project/:projectId - Get all files for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { visibility } = req.query;
    
    let whereClause = eq(fileAssets.projectId, projectId);
    
    // Filter by visibility if specified
    if (visibility && ['Client', 'Internal'].includes(visibility)) {
      whereClause = and(
        eq(fileAssets.projectId, projectId),
        eq(fileAssets.visibility, visibility)
      );
    }
    
    const projectFiles = await db
      .select({
        id: fileAssets.id,
        projectId: fileAssets.projectId,
        milestoneId: fileAssets.milestoneId,
        ticketId: fileAssets.ticketId,
        filename: fileAssets.filename,
        originalName: fileAssets.originalName,
        url: fileAssets.url,
        contentType: fileAssets.contentType,
        size: fileAssets.size,
        visibility: fileAssets.visibility,
        createdAt: fileAssets.createdAt,
        uploadedByName: users.name,
        uploadedByEmail: users.email
      })
      .from(fileAssets)
      .leftJoin(users, eq(fileAssets.uploadedByUserId, users.id))
      .where(whereClause)
      .orderBy(desc(fileAssets.createdAt));
    
    res.json({
      success: true,
      data: projectFiles,
      count: projectFiles.length
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project files'
    });
  }
});

// GET /api/files/milestone/:milestoneId - Get files for milestone
router.get('/milestone/:milestoneId', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    
    const milestoneFiles = await db
      .select({
        id: fileAssets.id,
        projectId: fileAssets.projectId,
        milestoneId: fileAssets.milestoneId,
        filename: fileAssets.filename,
        originalName: fileAssets.originalName,
        url: fileAssets.url,
        contentType: fileAssets.contentType,
        size: fileAssets.size,
        visibility: fileAssets.visibility,
        createdAt: fileAssets.createdAt,
        uploadedByName: users.name
      })
      .from(fileAssets)
      .leftJoin(users, eq(fileAssets.uploadedByUserId, users.id))
      .where(eq(fileAssets.milestoneId, milestoneId))
      .orderBy(desc(fileAssets.createdAt));
    
    res.json({
      success: true,
      data: milestoneFiles,
      count: milestoneFiles.length
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
router.post('/upload', async (req, res) => {
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
    
    if (!['Client', 'Internal'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "Client" or "Internal"'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        // Generate thumbnail for images
        const thumbnailUrl = await generateThumbnail(file.path, file.filename);
        
        // Get actual file size
        const fileSize = await getFileSize(file.path);
        
        // Create file asset record
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
            contentType: file.mimetype,
            size: fileSize,
            visibility
          })
          .returning();
        
        uploadedFiles.push({
          ...fileAsset[0],
          thumbnailUrl
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
    
    if (!['Client', 'Internal'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "Client" or "Internal"'
      });
    }
    
    const updatedFile = await db
      .update(fileAssets)
      .set({ visibility })
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
      message: `File visibility updated to ${visibility}`
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