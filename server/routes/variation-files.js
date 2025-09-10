// Variation File Management API Routes
// Restricted to images and PDFs only for client approval workflow

const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
const router = express.Router();
const { db, variationFiles, variationRequests, projects } = require('../database');
const { eq, and, desc } = require('drizzle-orm');

// File upload configuration with restrictions for images and PDFs only
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/variations/';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `variation-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed for variation attachments'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper function to generate preview for images
async function generatePreview(filePath, fileName, fileType) {
  try {
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
      const previewDir = 'uploads/variations/previews/';
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
      
      return `/uploads/variations/previews/${previewFileName}`;
    }
    
    // For PDFs, return null (handled in frontend)
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

// POST /api/variations/:id/files - Upload files to variation
router.post('/:variationId/files', upload.array('files', 10), async (req, res) => {
  try {
    const { variationId } = req.params;
    const { uploadedBy = 'manager-001' } = req.body; // Default manager user

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    // Verify variation exists and get project ID
    const variationResult = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, variationId))
      .limit(1);

    if (variationResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }

    const variation = variationResult[0];
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Generate preview for images
        const previewUrl = await generatePreview(file.path, file.filename, file.mimetype);
        
        // Get actual file size
        const fileSize = await getFileSize(file.path);
        
        // Create variation file record
        const variationFile = await db
          .insert(variationFiles)
          .values({
            id: crypto.randomUUID(),
            projectId: variation.projectId,
            variationId,
            uploadedBy,
            fileName: file.originalname,
            fileType: file.mimetype,
            size: fileSize,
            storageUrl: `/uploads/variations/${file.filename}`,
            previewUrl,
            visibility: 'client', // All variation files are client-visible
            status: 'active'
          })
          .returning();
        
        uploadedFiles.push({
          ...variationFile[0],
          uploadProgress: 100
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
      message: `${uploadedFiles.length} file(s) uploaded successfully to variation`
    });
  } catch (error) {
    console.error('Error uploading variation files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload variation files'
    });
  }
});

// GET /api/variations/:id/files - Get files for variation (client-visible only)
router.get('/:variationId/files', async (req, res) => {
  try {
    const { variationId } = req.params;
    
    const files = await db
      .select()
      .from(variationFiles)
      .where(and(
        eq(variationFiles.variationId, variationId),
        eq(variationFiles.status, 'active'),
        eq(variationFiles.visibility, 'client')
      ))
      .orderBy(desc(variationFiles.createdAt));

    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching variation files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variation files'
    });
  }
});

// DELETE /api/variations/:variationId/files/:fileId - Delete a variation file
router.delete('/:variationId/files/:fileId', async (req, res) => {
  try {
    const { variationId, fileId } = req.params;
    
    // Get file info before deletion
    const fileRecord = await db
      .select()
      .from(variationFiles)
      .where(and(
        eq(variationFiles.id, fileId),
        eq(variationFiles.variationId, variationId)
      ))
      .limit(1);
    
    if (fileRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation file not found'
      });
    }
    
    const file = fileRecord[0];
    
    // Mark as deleted (soft delete)
    await db
      .update(variationFiles)
      .set({ 
        status: 'deleted',
        updatedAt: new Date()
      })
      .where(eq(variationFiles.id, fileId));
    
    // Optionally delete physical files
    try {
      const filePath = path.join(process.cwd(), file.storageUrl);
      await fs.unlink(filePath);
      
      if (file.previewUrl) {
        const previewPath = path.join(process.cwd(), file.previewUrl);
        await fs.unlink(previewPath).catch(() => {}); // Ignore if preview doesn't exist
      }
    } catch (fsError) {
      console.warn('Could not delete physical file:', fsError.message);
      // Continue - database record is already marked as deleted
    }
    
    res.json({
      success: true,
      message: 'Variation file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting variation file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete variation file'
    });
  }
});

module.exports = router;