// Team Management API Routes
// Add/Remove team members with validation and persistence

const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { db, projectTeam, users, projects } = require('../database');
const { eq, and } = require('drizzle-orm');

// GET /api/team/users - Get all available users for team assignment
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        isOnline: users.isOnline
      })
      .from(users)
      .orderBy(users.name);
    
    res.json({
      success: true,
      data: allUsers,
      count: allUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// GET /api/team - Get team members (with optional projectId query parameter)
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'projectId query parameter is required'
      });
    }
    
    // Query team members with user details
    const teamMembers = await db
      .select({
        id: projectTeam.id,
        projectId: projectTeam.projectId,
        userId: projectTeam.userId,
        role: projectTeam.role,
        addedAt: projectTeam.addedAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userRole: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        isOnline: users.isOnline
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(eq(projectTeam.projectId, projectId));
    
    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

// GET /api/team/project/:projectId - Get team members for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Query team members with user details
    const teamMembers = await db
      .select({
        id: projectTeam.id,
        projectId: projectTeam.projectId,
        userId: projectTeam.userId,
        role: projectTeam.role,
        addedAt: projectTeam.addedAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userRole: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        isOnline: users.isOnline
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(eq(projectTeam.projectId, projectId));
    
    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

// POST /api/team - Add team member to project
router.post('/', async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;
    
    // Validate required fields
    if (!projectId || !userId || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, userId, role'
      });
    }
    
    // Check if project exists
    const projectExists = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    
    if (projectExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Check if user exists
    const userExists = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check for duplicate assignment
    const existingAssignment = await db
      .select()
      .from(projectTeam)
      .where(and(
        eq(projectTeam.projectId, projectId),
        eq(projectTeam.userId, userId)
      ))
      .limit(1);
    
    if (existingAssignment.length > 0) {
      return res.status(409).json({
        success: false,
        error: `${userExists[0].name} is already assigned to this project`
      });
    }
    
    // Add team member
    const teamMemberId = crypto.randomUUID();
    const newTeamMember = await db
      .insert(projectTeam)
      .values({
        id: teamMemberId,
        projectId,
        userId,
        role
      })
      .returning();
    
    // Get full team member details for response
    const teamMemberWithDetails = await db
      .select({
        id: projectTeam.id,
        projectId: projectTeam.projectId,
        userId: projectTeam.userId,
        role: projectTeam.role,
        addedAt: projectTeam.addedAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userRole: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        isOnline: users.isOnline
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(eq(projectTeam.id, newTeamMember[0].id));
    
    res.status(201).json({
      success: true,
      data: teamMemberWithDetails[0],
      message: `${userExists[0].name} added to project team successfully`
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add team member'
    });
  }
});

// DELETE /api/team/:teamMemberId - Remove team member from project
router.delete('/:teamMemberId', async (req, res) => {
  try {
    const { teamMemberId } = req.params;
    
    // Get team member details before deletion
    const teamMemberDetails = await db
      .select({
        id: projectTeam.id,
        projectId: projectTeam.projectId,
        userId: projectTeam.userId,
        role: projectTeam.role,
        userName: users.name
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(eq(projectTeam.id, teamMemberId))
      .limit(1);
    
    if (teamMemberDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    // Remove team member
    await db
      .delete(projectTeam)
      .where(eq(projectTeam.id, teamMemberId));
    
    res.json({
      success: true,
      message: `${teamMemberDetails[0].userName} removed from project team successfully`
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

// DELETE /api/team/project/:projectId/user/:userId - Remove user from project (alternative endpoint)
router.delete('/project/:projectId/user/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    // Get team member details before deletion
    const teamMemberDetails = await db
      .select({
        id: projectTeam.id,
        userName: users.name
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(and(
        eq(projectTeam.projectId, projectId),
        eq(projectTeam.userId, userId)
      ))
      .limit(1);
    
    if (teamMemberDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found in this project'
      });
    }
    
    // Remove team member
    await db
      .delete(projectTeam)
      .where(and(
        eq(projectTeam.projectId, projectId),
        eq(projectTeam.userId, userId)
      ));
    
    res.json({
      success: true,
      message: `${teamMemberDetails[0].userName} removed from project team successfully`
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

// PUT /api/team/:teamMemberId/role - Update team member role
router.put('/:teamMemberId/role', async (req, res) => {
  try {
    const { teamMemberId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }
    
    const updatedTeamMember = await db
      .update(projectTeam)
      .set({ role })
      .where(eq(projectTeam.id, teamMemberId))
      .returning();
    
    if (updatedTeamMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    // Get updated details with user info
    const teamMemberWithDetails = await db
      .select({
        id: projectTeam.id,
        projectId: projectTeam.projectId,
        userId: projectTeam.userId,
        role: projectTeam.role,
        addedAt: projectTeam.addedAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userRole: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        isOnline: users.isOnline
      })
      .from(projectTeam)
      .leftJoin(users, eq(projectTeam.userId, users.id))
      .where(eq(projectTeam.id, teamMemberId));
    
    res.json({
      success: true,
      data: teamMemberWithDetails[0],
      message: 'Team member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member role'
    });
  }
});

// GET /api/team/available-users - Get users not assigned to specific project
router.get('/available-users/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get all users not assigned to this project
    const assignedUserIds = await db
      .select({ userId: projectTeam.userId })
      .from(projectTeam)
      .where(eq(projectTeam.projectId, projectId));
    
    const assignedIds = assignedUserIds.map(u => u.userId);
    
    let availableUsers;
    if (assignedIds.length > 0) {
      availableUsers = await db
        .select()
        .from(users)
        .where(not(inArray(users.id, assignedIds)));
    } else {
      availableUsers = await db.select().from(users);
    }
    
    res.json({
      success: true,
      data: availableUsers,
      count: availableUsers.length
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available users'
    });
  }
});

module.exports = router;