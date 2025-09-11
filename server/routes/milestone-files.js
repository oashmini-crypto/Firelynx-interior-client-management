// Modern Milestone Files API Routes
// Drag-and-drop upload with progress bars and preview support

const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { db, milestoneFiles, users } = require('../database');
const { eq, and, desc } = require('drizzle-orm');

// Helper function to generate preview for images and PDFs
async function generatePreview(filePath, fileName, fileType) {
  try {
    const ext = path.extname(fileName).toLowerCase();
    
    // For images - create thumbnail
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
    
    // For PDFs - return PDF icon or try to generate thumbnail
    if (fileType === 'application/pdf') {
      // In a real implementation, you'd use pdf2pic or similar
      // For now, return null and handle in frontend
      return null;
    }
    
    // For DWG files - check if conversion is possible
    if (ext === '.dwg') {
      // In real implementation, convert DWG to PDF/PNG using AutoCAD tools
      // For now, return null to show "Preview unavailable" message
      return null;
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

// GET /api/milestone-files/:milestoneId - Get files for a milestone
router.get('/:milestoneId', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { visibility, include } = req.query;
    
    let whereClause = eq(milestoneFiles.milestoneId, milestoneId);
    
    // Filter by visibility if specified (client portal filter)
    if (visibility) {
      whereClause = and(
        eq(milestoneFiles.milestoneId, milestoneId),
        eq(milestoneFiles.visibility, visibility)
      );
    }
    
    // Filter by status if include parameter is provided
    if (include) {
      const allowedStatuses = include.split(',').map(s => s.trim());
      const { inArray } = require('drizzle-orm');
      whereClause = visibility 
        ? and(whereClause, inArray(milestoneFiles.status, allowedStatuses))
        : and(eq(milestoneFiles.milestoneId, milestoneId), inArray(milestoneFiles.status, allowedStatuses));
    }
    
    const files = await db
      .select({
        id: milestoneFiles.id,
        projectId: milestoneFiles.projectId,
        milestoneId: milestoneFiles.milestoneId,
        fileName: milestoneFiles.fileName,
        fileType: milestoneFiles.fileType,
        size: milestoneFiles.size,
        storageUrl: milestoneFiles.storageUrl,
        previewUrl: milestoneFiles.previewUrl,
        visibility: milestoneFiles.visibility,
        status: milestoneFiles.status,
        createdAt: milestoneFiles.createdAt,
        uploadedBy: milestoneFiles.uploadedBy,
        uploaderName: users.name,
        uploaderEmail: users.email
      })
      .from(milestoneFiles)
      .leftJoin(users, eq(milestoneFiles.uploadedBy, users.id))
      .where(whereClause)
      .orderBy(desc(milestoneFiles.createdAt));
    
    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching milestone files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestone files'
    });
  }
});

// POST /api/milestone-files/upload - Upload files to milestone
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
      uploadedBy,
      visibility = 'client'
    } = req.body;
    
    if (!projectId || !milestoneId || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, milestoneId, uploadedBy'
      });
    }
    
    if (!['client', 'internal'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "client" or "internal"'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        // Generate preview if applicable
        const previewUrl = await generatePreview(file.path, file.originalname, file.mimetype);
        
        // Get actual file size
        const fileSize = await getFileSize(file.path);
        
        // Create milestone file record
        const milestoneFile = await db
          .insert(milestoneFiles)
          .values({
            projectId,
            milestoneId,
            uploadedBy,
            fileName: file.originalname,
            fileType: file.mimetype,
            size: fileSize,
            storageUrl: `/uploads/${file.filename}`,
            previewUrl,
            visibility,
            status: 'pending' // Explicitly set default status
          })
          .returning();
        
        uploadedFiles.push({
          ...milestoneFile[0],
          uploadProgress: 100 // Since upload is complete
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
    console.error('Error uploading milestone files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

// DELETE /api/milestone-files/:id - Delete a file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info before deletion
    const fileRecord = await db
      .select()
      .from(milestoneFiles)
      .where(eq(milestoneFiles.id, id))
      .limit(1);
    
    if (fileRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const file = fileRecord[0];
    
    // Delete from database
    await db
      .delete(milestoneFiles)
      .where(eq(milestoneFiles.id, id));
    
    // Delete physical files
    try {
      const filePath = path.join(process.cwd(), file.storageUrl);
      await fs.unlink(filePath);
      
      if (file.previewUrl) {
        const previewPath = path.join(process.cwd(), file.previewUrl);
        await fs.unlink(previewPath).catch(() => {}); // Ignore if preview doesn't exist
      }
    } catch (fsError) {
      console.warn('Could not delete physical file:', fsError.message);
      // Continue - database record is already deleted
    }
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting milestone file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

// GET /api/milestone-files/project/:projectId - Get all milestone files for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { visibility } = req.query;
    
    let whereClause = eq(milestoneFiles.projectId, projectId);
    
    if (visibility) {
      whereClause = and(
        eq(milestoneFiles.projectId, projectId),
        eq(milestoneFiles.visibility, visibility)
      );
    }
    
    const files = await db
      .select({
        id: milestoneFiles.id,
        projectId: milestoneFiles.projectId,
        milestoneId: milestoneFiles.milestoneId,
        fileName: milestoneFiles.fileName,
        fileType: milestoneFiles.fileType,
        size: milestoneFiles.size,
        storageUrl: milestoneFiles.storageUrl,
        previewUrl: milestoneFiles.previewUrl,
        visibility: milestoneFiles.visibility,
        status: milestoneFiles.status,
        createdAt: milestoneFiles.createdAt,
        uploadedBy: milestoneFiles.uploadedBy,
        uploaderName: users.name,
        uploaderEmail: users.email
      })
      .from(milestoneFiles)
      .leftJoin(users, eq(milestoneFiles.uploadedBy, users.id))
      .where(whereClause)
      .orderBy(desc(milestoneFiles.createdAt));
    
    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching project milestone files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestone files'
    });
  }
});

// PUT /api/milestone-files/:id/visibility - Update file visibility
router.put('/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;
    
    // Normalize visibility values
    let normalizedVisibility;
    if (visibility.toLowerCase() === 'client') {
      normalizedVisibility = 'client';
    } else if (visibility.toLowerCase() === 'internal') {
      normalizedVisibility = 'internal';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid visibility. Must be "client" or "internal"'
      });
    }
    
    const updatedFile = await db
      .update(milestoneFiles)
      .set({ visibility: normalizedVisibility })
      .where(eq(milestoneFiles.id, id))
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
    console.error('Error updating milestone file visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file visibility'
    });
  }
});

// PUT /api/milestone-files/:id/status - Accept or decline a file
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, accepted, or declined'
      });
    }
    
    // Check if file exists
    const existingFile = await db
      .select()
      .from(milestoneFiles)
      .where(eq(milestoneFiles.id, id))
      .limit(1);
    
    if (existingFile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Update file status
    const updatedFile = await db
      .update(milestoneFiles)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(milestoneFiles.id, id))
      .returning();
    
    res.json({
      success: true,
      data: updatedFile[0],
      message: `File ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file status'
    });
  }
});

module.exports = router;