// Ticket API Routes with Same Controls as Global Tickets

const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { db, tickets, users, fileAssets, documentCounters } = require('../database');
const { alias } = require('drizzle-orm/pg-core');
const { eq, desc, and, sql } = require('drizzle-orm');

// Reference data for ticket dropdowns
const TICKET_PRIORITIES = [
  { value: 'Low', label: 'Low', description: 'Minor issues that can be addressed in the next release' },
  { value: 'Medium', label: 'Medium', description: 'Standard priority issues requiring attention' },
  { value: 'High', label: 'High', description: 'Important issues that should be resolved quickly' },
  { value: 'Critical', label: 'Critical', description: 'Urgent issues requiring immediate attention' }
];

const TICKET_CATEGORIES = [
  { value: 'Technical', label: 'Technical Issue', description: 'Software bugs, system errors, or technical problems' },
  { value: 'Design', label: 'Design Request', description: 'Changes to visual design, layout, or styling' },
  { value: 'Content', label: 'Content Update', description: 'Text changes, image updates, or content modifications' },
  { value: 'Feature', label: 'Feature Request', description: 'New functionality or feature additions' },
  { value: 'Support', label: 'General Support', description: 'Questions, guidance, or general assistance' },
  { value: 'Access', label: 'Access Issue', description: 'Login problems, permissions, or account access' },
  { value: 'Performance', label: 'Performance Issue', description: 'Speed, loading, or system performance problems' },
  { value: 'Other', label: 'Other', description: 'Issues that don\'t fit into other categories' }
];

// Helper function to generate ticket numbers
async function generateTicketNumber() {
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
        .values({ year: currentYear, ticketCounter: 1 })
        .returning();
      counter = 1;
    } else {
      const updatedCounter = await db
        .update(documentCounters)
        .set({ 
          ticketCounter: counterResult[0].ticketCounter + 1,
          updatedAt: new Date()
        })
        .where(eq(documentCounters.year, currentYear))
        .returning();
      counter = updatedCounter[0].ticketCounter;
    }
    
    return `TK-${currentYear}-${counter.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating ticket number:', error);
    throw new Error('Failed to generate ticket number');
  }
}

// GET /api/tickets - Get all tickets (Global)
router.get('/', async (req, res) => {
  try {
    const assigneeUserAlias = alias(users, 'assigneeUser');
    
    const allTickets = await db
      .select({
        id: tickets.id,
        projectId: tickets.projectId,
        number: tickets.number,
        subject: tickets.subject,
        description: tickets.description,
        category: tickets.category,
        priority: tickets.priority,
        status: tickets.status,
        attachments: tickets.attachments,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        requesterName: users.name,
        requesterEmail: users.email,
        assigneeName: assigneeUserAlias.name,
        assigneeEmail: assigneeUserAlias.email
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.requesterUserId, users.id))
      .leftJoin(assigneeUserAlias, eq(tickets.assigneeUserId, assigneeUserAlias.id))
      .orderBy(desc(tickets.createdAt));
    
    res.json({
      success: true,
      data: allTickets,
      count: allTickets.length
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets'
    });
  }
});

// GET /api/tickets/project/:projectId - Get tickets for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const requesterUserAlias = alias(users, 'requesterUser');
    const assigneeUserAlias = alias(users, 'assigneeUser');
    
    const projectTickets = await db
      .select({
        id: tickets.id,
        projectId: tickets.projectId,
        number: tickets.number,
        subject: tickets.subject,
        description: tickets.description,
        category: tickets.category,
        priority: tickets.priority,
        status: tickets.status,
        attachments: tickets.attachments,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        requesterName: requesterUserAlias.name,
        requesterEmail: requesterUserAlias.email,
        assigneeName: assigneeUserAlias.name,
        assigneeEmail: assigneeUserAlias.email
      })
      .from(tickets)
      .leftJoin(requesterUserAlias, eq(tickets.requesterUserId, requesterUserAlias.id))
      .leftJoin(assigneeUserAlias, eq(tickets.assigneeUserId, assigneeUserAlias.id))
      .where(eq(tickets.projectId, projectId))
      .orderBy(desc(tickets.createdAt));
    
    res.json({
      success: true,
      data: projectTickets,
      count: projectTickets.length
    });
  } catch (error) {
    console.error('Error fetching project tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project tickets'
    });
  }
});

// POST /api/tickets - Create new ticket
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      subject,
      description,
      category,
      priority = 'Medium',
      requesterUserId,
      assigneeUserId,
      attachments = []
    } = req.body;
    
    if (!projectId || !subject || !description || !category || !requesterUserId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, subject, description, category, requesterUserId'
      });
    }
    
    // Generate ticket number
    const number = await generateTicketNumber();
    
    // Create ticket with UUID
    const ticketId = crypto.randomUUID();
    const newTicket = await db
      .insert(tickets)
      .values({
        id: ticketId,
        projectId,
        number,
        subject,
        description,
        category,
        priority,
        status: 'Open',
        requesterUserId,
        assigneeUserId: assigneeUserId || null,
        attachments: JSON.stringify(attachments)
      })
      .returning();
    
    res.status(201).json({
      success: true,
      data: newTicket[0],
      message: `Ticket ${number} created successfully`
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket'
    });
  }
});

// PUT /api/tickets/:id - Update ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    // Serialize attachments if provided
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    
    const updatedTicket = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    
    if (updatedTicket.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedTicket[0],
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket'
    });
  }
});

// POST /api/tickets/:id/assign - Assign ticket to user
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeUserId } = req.body;
    
    const updatedTicket = await db
      .update(tickets)
      .set({
        assigneeUserId,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    
    if (updatedTicket.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedTicket[0],
      message: 'Ticket assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign ticket'
    });
  }
});

// POST /api/tickets/:id/status - Update ticket status
router.post('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "Open", "In Progress", "Resolved", or "Closed"'
      });
    }
    
    const updatedTicket = await db
      .update(tickets)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    
    if (updatedTicket.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedTicket[0],
      message: `Ticket status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket status'
    });
  }
});

// POST /api/tickets/:id/attachments - Add attachments to ticket
router.post('/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const { uploadedByUserId } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    // Get ticket to verify it exists and get projectId
    const ticket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    
    if (ticket.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    const uploadedFiles = [];
    
    // Upload files as file assets
    for (const file of req.files) {
      const fileAsset = await db
        .insert(fileAssets)
        .values({
          projectId: ticket[0].projectId,
          ticketId: id,
          uploadedByUserId,
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          contentType: file.mimetype,
          size: file.size,
          visibility: 'Internal' // Ticket attachments are internal by default
        })
        .returning();
      
      uploadedFiles.push(fileAsset[0]);
    }
    
    // Update ticket attachments array
    const currentAttachments = JSON.parse(ticket[0].attachments || '[]');
    const newAttachmentIds = uploadedFiles.map(f => f.id);
    const updatedAttachments = [...currentAttachments, ...newAttachmentIds];
    
    await db
      .update(tickets)
      .set({
        attachments: JSON.stringify(updatedAttachments),
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id));
    
    res.status(201).json({
      success: true,
      data: uploadedFiles,
      count: uploadedFiles.length,
      message: `${uploadedFiles.length} attachment(s) added to ticket`
    });
  } catch (error) {
    console.error('Error adding ticket attachments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add ticket attachments'
    });
  }
});

// DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated file assets
    await db
      .delete(fileAssets)
      .where(eq(fileAssets.ticketId, id));
    
    // Delete ticket
    const deletedTicket = await db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning();
    
    if (deletedTicket.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticket'
    });
  }
});

// GET /api/tickets/priorities - Get available priorities
router.get('/priorities', async (req, res) => {
  try {
    res.json({
      success: true,
      data: TICKET_PRIORITIES
    });
  } catch (error) {
    console.error('Error fetching ticket priorities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket priorities'
    });
  }
});

// GET /api/tickets/categories - Get available categories
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      data: TICKET_CATEGORIES
    });
  } catch (error) {
    console.error('Error fetching ticket categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket categories'
    });
  }
});

module.exports = router;