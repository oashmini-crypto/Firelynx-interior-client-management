// Milestone API Routes with File Upload Persistence

const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const { db, milestones, fileAssets, users, milestoneFiles } = require('../database');
const { eq, desc, and } = require('drizzle-orm');

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

// Helper function to generate preview for images
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

// === FILE ROUTES (Must come before parameterized milestone routes) ===

// GET /api/milestones/:mid/files - Get files for a milestone
router.get('/:mid/files', async (req, res) => {
  try {
    const { mid } = req.params;
    const { visibility, include } = req.query;
    
    let whereClause = eq(milestoneFiles.milestoneId, mid);
    
    // Handle visibility filter (client portal filter)
    if (visibility) {
      whereClause = and(
        eq(milestoneFiles.milestoneId, mid),
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
    
    // Handle include filter for client role (default to both pending and accepted)
    let filteredFiles = files;
    if (include) {
      const statuses = include.split(',');
      filteredFiles = files.filter(file => statuses.includes(file.status));
    } else if (visibility === 'client') {
      // Default for client: show both pending and accepted
      filteredFiles = files.filter(file => ['pending', 'accepted'].includes(file.status));
    }
    
    res.json({
      success: true,
      data: filteredFiles,
      count: filteredFiles.length
    });
  } catch (error) {
    console.error('Error fetching milestone files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestone files'
    });
  }
});

// POST /api/milestones/:mid/files - Upload files to milestone
router.post('/:mid/files', upload.array('files', 10), async (req, res) => {
  try {
    const { mid } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    const {
      projectId,
      uploadedBy = '7b024117-7298-4768-9260-7e6beb4209c7', // Default to Alice Cooper
      visibility = 'client'
    } = req.body;
    
    if (!projectId || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, uploadedBy'
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
            milestoneId: mid,
            uploadedBy,
            fileName: file.originalname,
            fileType: file.mimetype,
            size: fileSize,
            storageUrl: `/uploads/${file.filename}`,
            previewUrl,
            visibility,
            status: 'pending' // Default to pending for client approval
          })
          .returning();
        
        uploadedFiles.push({
          ...milestoneFile[0],
          uploadProgress: 100 // Upload complete
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        // Return error immediately instead of continuing
        return res.status(500).json({
          success: false,
          error: `Failed to upload file ${file.originalname}: ${fileError.message}`
        });
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

// PUT /api/milestones/:mid/files/:fileId/status - Update file status (for accept/decline)
router.put('/:mid/files/:fileId/status', async (req, res) => {
  try {
    const { mid, fileId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "pending", "accepted", or "declined"'
      });
    }
    
    // Verify the file belongs to this milestone (ownership check)
    const existingFile = await db
      .select()
      .from(milestoneFiles)
      .where(and(
        eq(milestoneFiles.id, fileId),
        eq(milestoneFiles.milestoneId, mid)
      ))
      .limit(1);
    
    if (existingFile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found or does not belong to this milestone'
      });
    }
    
    // Update the file status
    const updatedFile = await db
      .update(milestoneFiles)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(milestoneFiles.id, fileId))
      .returning();
    
    const statusMessage = status === 'accepted' ? 'accepted' : 
                         status === 'declined' ? 'declined' : 'pending';
    
    res.json({
      success: true,
      data: updatedFile[0],
      message: `File ${statusMessage} successfully`
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file status'
    });
  }
});

// === MILESTONE ROUTES ===

// GET /api/milestones - Get milestones (with optional projectId query parameter)
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'projectId query parameter is required'
      });
    }
    
    const projectMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(milestones.expectedDate);
    
    // Get file count for each milestone
    const milestonesWithFiles = await Promise.all(
      projectMilestones.map(async (milestone) => {
        const files = await db
          .select()
          .from(fileAssets)
          .where(eq(fileAssets.milestoneId, milestone.id));
        
        return {
          ...milestone,
          fileCount: files.length,
          files: files
        };
      })
    );
    
    res.json({
      success: true,
      data: milestonesWithFiles,
      count: milestonesWithFiles.length
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestones'
    });
  }
});

// GET /api/milestones/project/:projectId - Get milestones for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(milestones.expectedDate);
    
    // Get file count for each milestone
    const milestonesWithFiles = await Promise.all(
      projectMilestones.map(async (milestone) => {
        const files = await db
          .select()
          .from(fileAssets)
          .where(eq(fileAssets.milestoneId, milestone.id));
        
        return {
          ...milestone,
          fileCount: files.length,
          files: files
        };
      })
    );
    
    res.json({
      success: true,
      data: milestonesWithFiles,
      count: milestonesWithFiles.length
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestones'
    });
  }
});

// POST /api/milestones - Create milestone
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      expectedDate,
      status = 'Pending',
      progress = 0
    } = req.body;
    
    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, title'
      });
    }
    
    const newMilestone = await db
      .insert(milestones)
      .values({
        projectId,
        title,
        description,
        status,
        progress,
        expectedDate: expectedDate ? new Date(expectedDate) : null
      })
      .returning();
    
    res.status(201).json({
      success: true,
      data: newMilestone[0],
      message: 'Milestone created successfully'
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create milestone'
    });
  }
});

// PUT /api/milestones/:id - Update milestone
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (updateData.expectedDate) {
      updateData.expectedDate = new Date(updateData.expectedDate);
    }
    if (updateData.completedDate) {
      updateData.completedDate = new Date(updateData.completedDate);
    }
    
    const updatedMilestone = await db
      .update(milestones)
      .set(updateData)
      .where(eq(milestones.id, id))
      .returning();
    
    if (updatedMilestone.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedMilestone[0],
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update milestone'
    });
  }
});

// POST /api/milestones/:id/upload - Upload file to milestone
router.post('/:id/upload', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      uploadedByUserId,
      visibility = 'Client'
    } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    if (!uploadedByUserId) {
      return res.status(400).json({
        success: false,
        error: 'uploadedByUserId is required'
      });
    }
    
    // Verify milestone exists
    const milestone = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, id))
      .limit(1);
    
    if (milestone.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      const fileAsset = await db
        .insert(fileAssets)
        .values({
          projectId: milestone[0].projectId,
          milestoneId: id,
          uploadedByUserId,
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          contentType: file.mimetype,
          size: file.size,
          visibility
        })
        .returning();
      
      uploadedFiles.push(fileAsset[0]);
    }
    
    res.status(201).json({
      success: true,
      data: uploadedFiles,
      count: uploadedFiles.length,
      message: `${uploadedFiles.length} file(s) uploaded to milestone successfully`
    });
  } catch (error) {
    console.error('Error uploading files to milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files to milestone'
    });
  }
});

// DELETE /api/milestones/:id - Delete milestone
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete all files associated with this milestone
    await db
      .delete(fileAssets)
      .where(eq(fileAssets.milestoneId, id));
    
    // Then delete the milestone
    const deletedMilestone = await db
      .delete(milestones)
      .where(eq(milestones.id, id))
      .returning();
    
    if (deletedMilestone.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedMilestone[0],
      message: 'Milestone and associated files deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete milestone'
    });
  }
});

module.exports = router;