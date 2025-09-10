// Approval API Routes with File Upload Integration

const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const { db, approvalPackets, approvalItems, approvalFiles, fileAssets, users, documentCounters } = require('../database');
const { eq, desc, and, inArray } = require('drizzle-orm');

// Helper function to generate approval numbers
async function generateApprovalNumber() {
  const currentYear = new Date().getFullYear();
  
  try {
    const counterResult = await db
      .select()
      .from(documentCounters)
      .where(eq(documentCounters.year, currentYear))
      .limit(1);
    
    let counter;
    if (counterResult.length === 0) {
      const newCounter = await db
        .insert(documentCounters)
        .values({ year: currentYear, approvalCounter: 1 })
        .returning();
      counter = 1;
    } else {
      const updatedCounter = await db
        .update(documentCounters)
        .set({ 
          approvalCounter: counterResult[0].approvalCounter + 1,
          updatedAt: new Date()
        })
        .where(eq(documentCounters.year, currentYear))
        .returning();
      counter = updatedCounter[0].approvalCounter;
    }
    
    return `AP-${currentYear}-${counter.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating approval number:', error);
    throw new Error('Failed to generate approval number');
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'approval-' + uniqueSuffix + path.extname(file.originalname));
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

// === APPROVAL FILE ROUTES (Must come before parameterized approval routes) ===

// GET /api/approvals/:id/files - Get files for an approval packet
router.get('/:id/files', async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility, include } = req.query;
    
    let whereClause = eq(approvalFiles.approvalId, id);
    
    // Handle visibility filter (client portal filter)
    if (visibility) {
      whereClause = and(
        eq(approvalFiles.approvalId, id),
        eq(approvalFiles.visibility, visibility)
      );
    }
    
    // Filter by status if include parameter is provided
    if (include) {
      const allowedStatuses = include.split(',').map(s => s.trim());
      whereClause = visibility 
        ? and(whereClause, inArray(approvalFiles.status, allowedStatuses))
        : and(eq(approvalFiles.approvalId, id), inArray(approvalFiles.status, allowedStatuses));
    }
    
    const files = await db
      .select({
        id: approvalFiles.id,
        projectId: approvalFiles.projectId,
        approvalId: approvalFiles.approvalId,
        fileName: approvalFiles.fileName,
        fileType: approvalFiles.fileType,
        size: approvalFiles.size,
        storageUrl: approvalFiles.storageUrl,
        previewUrl: approvalFiles.previewUrl,
        visibility: approvalFiles.visibility,
        status: approvalFiles.status,
        createdAt: approvalFiles.createdAt,
        uploadedBy: approvalFiles.uploadedBy,
        uploaderName: users.name,
        uploaderEmail: users.email
      })
      .from(approvalFiles)
      .leftJoin(users, eq(approvalFiles.uploadedBy, users.id))
      .where(whereClause)
      .orderBy(desc(approvalFiles.createdAt));
    
    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching approval files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval files'
    });
  }
});

// POST /api/approvals/:id/files - Upload files to an approval packet
router.post('/:id/files', upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    const {
      projectId,
      uploadedBy,
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
        
        // Create approval file record
        const approvalFile = await db
          .insert(approvalFiles)
          .values({
            projectId,
            approvalId: id,
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
          ...approvalFile[0],
          uploadProgress: 100 // Upload complete
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
    console.error('Error uploading approval files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

// PUT /api/approvals/:id/files/:fileId/status - Update file status
router.put('/:id/files/:fileId/status', async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, accepted, or declined'
      });
    }
    
    // Check if file exists and belongs to the approval
    const existingFile = await db
      .select()
      .from(approvalFiles)
      .where(and(
        eq(approvalFiles.id, fileId),
        eq(approvalFiles.approvalId, id)
      ))
      .limit(1);
    
    if (existingFile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found or does not belong to this approval'
      });
    }
    
    // Update file status
    const updatedFile = await db
      .update(approvalFiles)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(approvalFiles.id, fileId))
      .returning();
    
    res.json({
      success: true,
      data: updatedFile[0],
      message: `File ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating approval file status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file status'
    });
  }
});

// GET /api/approvals/project/:projectId - Get approvals for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectApprovals = await db
      .select()
      .from(approvalPackets)
      .where(eq(approvalPackets.projectId, projectId))
      .orderBy(desc(approvalPackets.createdAt));
    
    // Get items with file details for each approval
    const approvalsWithItems = await Promise.all(
      projectApprovals.map(async (approval) => {
        const items = await db
          .select({
            id: approvalItems.id,
            packetId: approvalItems.packetId,
            fileAssetId: approvalItems.fileAssetId,
            decision: approvalItems.decision,
            comment: approvalItems.comment,
            decidedAt: approvalItems.decidedAt,
            filename: fileAssets.filename,
            originalName: fileAssets.originalName,
            url: fileAssets.url,
            contentType: fileAssets.contentType,
            size: fileAssets.size,
            visibility: fileAssets.visibility
          })
          .from(approvalItems)
          .leftJoin(fileAssets, eq(approvalItems.fileAssetId, fileAssets.id))
          .where(eq(approvalItems.packetId, approval.id));
        
        return {
          ...approval,
          items: items
        };
      })
    );
    
    res.json({
      success: true,
      data: approvalsWithItems,
      count: approvalsWithItems.length
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approvals'
    });
  }
});

// POST /api/approvals - Create new approval packet
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      dueDate,
      fileAssetIds = []
    } = req.body;
    
    if (!projectId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, title, dueDate'
      });
    }
    
    // Generate approval number
    const number = await generateApprovalNumber();
    
    // Create approval packet
    const newApproval = await db
      .insert(approvalPackets)
      .values({
        id: crypto.randomUUID(),
        projectId,
        number,
        title,
        description,
        dueDate: new Date(dueDate),
        status: 'Pending'
      })
      .returning();
    
    const approvalId = newApproval[0].id;
    
    // Create approval items for each attached file
    const approvalItems_data = [];
    if (fileAssetIds.length > 0) {
      // Verify all file assets exist and belong to the project
      const files = await db
        .select()
        .from(fileAssets)
        .where(and(
          eq(fileAssets.projectId, projectId),
          inArray(fileAssets.id, fileAssetIds)
        ));
      
      if (files.length !== fileAssetIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Some file assets not found or do not belong to this project'
        });
      }
      
      for (const fileAssetId of fileAssetIds) {
        const item = await db
          .insert(approvalItems)
          .values({
            packetId: approvalId,
            fileAssetId,
            decision: 'Pending'
          })
          .returning();
        
        approvalItems_data.push(item[0]);
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        ...newApproval[0],
        items: approvalItems_data
      },
      message: `Approval ${number} created successfully`
    });
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create approval'
    });
  }
});

// POST /api/approvals/:id/send - Send approval for client review
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedApproval = await db
      .update(approvalPackets)
      .set({
        status: 'Sent',
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(approvalPackets.id, id))
      .returning();
    
    if (updatedApproval.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Approval not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedApproval[0],
      message: 'Approval sent to client successfully'
    });
  } catch (error) {
    console.error('Error sending approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send approval'
    });
  }
});

// POST /api/approvals/:id/decision - Client approval decision
router.post('/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, comment, signatureName } = req.body;
    
    if (!['Approved', 'Declined'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Must be "Approved" or "Declined"'
      });
    }
    
    if (decision === 'Declined' && !comment) {
      return res.status(400).json({
        success: false,
        error: 'Comment is required when declining'
      });
    }
    
    const updatedApproval = await db
      .update(approvalPackets)
      .set({
        status: decision,
        clientComment: comment,
        signatureName,
        decidedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(approvalPackets.id, id))
      .returning();
    
    if (updatedApproval.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Approval not found'
      });
    }
    
    // Update all approval items
    await db
      .update(approvalItems)
      .set({
        decision,
        comment,
        decidedAt: new Date()
      })
      .where(eq(approvalItems.packetId, id));
    
    res.json({
      success: true,
      data: updatedApproval[0],
      message: `Approval ${decision.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error processing approval decision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process approval decision'
    });
  }
});

// DELETE /api/approvals/:id - Delete approval
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete approval items first
    await db
      .delete(approvalItems)
      .where(eq(approvalItems.packetId, id));
    
    // Delete approval packet
    const deletedApproval = await db
      .delete(approvalPackets)
      .where(eq(approvalPackets.id, id))
      .returning();
    
    if (deletedApproval.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Approval not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Approval deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete approval'
    });
  }
});

module.exports = router;