// Approval API Routes with File Picker Integration

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { db, approvalPackets, approvalItems, fileAssets, users, documentCounters } = require('../database');
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