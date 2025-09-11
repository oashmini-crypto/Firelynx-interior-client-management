// Project-Scoped API Router
// All endpoints under /api/projects/:projectId/{resource}
// Validates project access and ensures data isolation

const express = require('express');
const crypto = require('crypto');
const router = express.Router({ mergeParams: true });
const { db, projects, clients, milestones, fileAssets, invoices, variationRequests, tickets, projectTeam, approvalPackets } = require('../database');
const { eq, and, desc } = require('drizzle-orm');

// Middleware to validate project access and load project
const validateProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project.length) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Attach project to request for use in subsequent handlers
    req.project = project[0];
    next();
  } catch (error) {
    console.error('Error validating project access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate project access'
    });
  }
};

// Apply project validation middleware to all routes
router.use(validateProjectAccess);

// GET /api/projects/:projectId/milestones
router.get('/milestones', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(desc(milestones.createdAt));

    res.json({
      success: true,
      data: projectMilestones
    });
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestones'
    });
  }
});

// GET /api/projects/:projectId/files
router.get('/files', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { visibility } = req.query;
    
    let whereClause = eq(fileAssets.projectId, projectId);
    
    if (visibility) {
      const normalizedVisibility = visibility.toLowerCase() === 'client' ? 'Client' : 'Internal';
      whereClause = and(
        eq(fileAssets.projectId, projectId),
        eq(fileAssets.visibility, normalizedVisibility)
      );
    }

    const projectFiles = await db
      .select()
      .from(fileAssets)
      .where(whereClause)
      .orderBy(desc(fileAssets.createdAt));

    res.json({
      success: true,
      data: projectFiles
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files'
    });
  }
});

// GET /api/projects/:projectId/variations
router.get('/variations', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectVariations = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.projectId, projectId))
      .orderBy(desc(variationRequests.createdAt));

    res.json({
      success: true,
      data: projectVariations
    });
  } catch (error) {
    console.error('Error fetching project variations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variations'
    });
  }
});

// GET /api/projects/:projectId/invoices
router.get('/invoices', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.projectId, projectId))
      .orderBy(desc(invoices.createdAt));

    res.json({
      success: true,
      data: projectInvoices
    });
  } catch (error) {
    console.error('Error fetching project invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// GET /api/projects/:projectId/tickets
router.get('/tickets', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectId, projectId))
      .orderBy(desc(tickets.createdAt));

    res.json({
      success: true,
      data: projectTickets
    });
  } catch (error) {
    console.error('Error fetching project tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets'
    });
  }
});

// GET /api/projects/:projectId/approvals
router.get('/approvals', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectApprovals = await db
      .select()
      .from(approvalPackets)
      .where(eq(approvalPackets.projectId, projectId))
      .orderBy(desc(approvalPackets.createdAt));

    res.json({
      success: true,
      data: projectApprovals
    });
  } catch (error) {
    console.error('Error fetching project approvals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approvals'
    });
  }
});

// GET /api/projects/:projectId/team
router.get('/team', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectTeamMembers = await db
      .select()
      .from(projectTeam)
      .where(eq(projectTeam.projectId, projectId))
      .orderBy(desc(projectTeam.addedAt));

    res.json({
      success: true,
      data: projectTeamMembers
    });
  } catch (error) {
    console.error('Error fetching project team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team'
    });
  }
});

// POST endpoints for creating resources (all must validate project ownership)

// POST /api/projects/:projectId/milestones
router.post('/milestones', async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestoneData = {
      ...req.body,
      projectId, // Ensure project ID is set from URL
      id: crypto.randomUUID()
    };

    const [newMilestone] = await db
      .insert(milestones)
      .values(milestoneData)
      .returning();

    res.status(201).json({
      success: true,
      data: newMilestone
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create milestone'
    });
  }
});

// Similar POST patterns for other resources...
// Note: All POST/PUT/DELETE operations must validate that the resource belongs to the project

module.exports = router;