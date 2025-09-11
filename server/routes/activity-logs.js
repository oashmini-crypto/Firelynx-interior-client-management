const express = require('express');
const { db, activityLogs, users, projects } = require('../database');
const { eq, desc, and, gte, lte, like, sql } = require('drizzle-orm');
const router = express.Router();

// Create a new activity log entry
router.post('/', async (req, res) => {
  try {
    const { projectId, userId, actionType, description, metadata } = req.body;
    
    if (!projectId || !userId || !actionType || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, userId, actionType, description'
      });
    }

    const newLog = await db.insert(activityLogs).values({
      projectId,
      userId,
      actionType,
      description,
      metadata: metadata || null
    }).returning();

    res.json({
      success: true,
      data: newLog[0],
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('❌ Activity log creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create activity log'
    });
  }
});

// Get activity logs with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      projectId, 
      userId, 
      actionType, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = req.query;

    // Build filter conditions
    const conditions = [];
    
    if (projectId) {
      conditions.push(eq(activityLogs.projectId, projectId));
    }
    
    if (userId) {
      conditions.push(eq(activityLogs.userId, userId));
    }
    
    if (actionType) {
      conditions.push(eq(activityLogs.actionType, actionType));
    }
    
    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(endDate)));
    }

    // Build the query with joins to get user and project names
    let query = db
      .select({
        id: activityLogs.id,
        projectId: activityLogs.projectId,
        projectTitle: projects.title,
        userId: activityLogs.userId,
        userName: users.name,
        userEmail: users.email,
        actionType: activityLogs.actionType,
        description: activityLogs.description,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .leftJoin(projects, eq(activityLogs.projectId, projects.id))
      .orderBy(desc(activityLogs.createdAt));

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply pagination
    const logs = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Get total count for pagination
    let countQuery = db
      .select({ count: sql`count(*)` })
      .from(activityLogs);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: parseInt(count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(count)
      }
    });
  } catch (error) {
    console.error('❌ Activity logs fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity logs'
    });
  }
});

// Get activity log summary/stats
router.get('/stats', async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    
    const conditions = [];
    
    if (projectId) {
      conditions.push(eq(activityLogs.projectId, projectId));
    }
    
    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(endDate)));
    }

    // Get activity counts by type
    let actionTypeQuery = db
      .select({
        actionType: activityLogs.actionType,
        count: sql`count(*)`
      })
      .from(activityLogs)
      .groupBy(activityLogs.actionType);
    
    if (conditions.length > 0) {
      actionTypeQuery = actionTypeQuery.where(and(...conditions));
    }
    
    const actionTypeCounts = await actionTypeQuery;

    // Get activity counts by user
    let userQuery = db
      .select({
        userId: activityLogs.userId,
        userName: users.name,
        count: sql`count(*)`
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .groupBy(activityLogs.userId, users.name);
    
    if (conditions.length > 0) {
      userQuery = userQuery.where(and(...conditions));
    }
    
    const userCounts = await userQuery;

    // Get total count
    let totalQuery = db
      .select({ count: sql`count(*)` })
      .from(activityLogs);
    
    if (conditions.length > 0) {
      totalQuery = totalQuery.where(and(...conditions));
    }
    
    const [{ count: totalCount }] = await totalQuery;

    res.json({
      success: true,
      data: {
        totalActivities: parseInt(totalCount),
        actionTypeCounts,
        userCounts
      }
    });
  } catch (error) {
    console.error('❌ Activity stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity stats'
    });
  }
});

// Export activity logs to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { projectId, userId, actionType, startDate, endDate } = req.query;
    
    // Build filter conditions (same as main GET route)
    const conditions = [];
    
    if (projectId) {
      conditions.push(eq(activityLogs.projectId, projectId));
    }
    
    if (userId) {
      conditions.push(eq(activityLogs.userId, userId));
    }
    
    if (actionType) {
      conditions.push(eq(activityLogs.actionType, actionType));
    }
    
    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(endDate)));
    }

    // Get all logs (no pagination for export)
    let query = db
      .select({
        timestamp: activityLogs.createdAt,
        user: users.name,
        project: projects.title,
        actionType: activityLogs.actionType,
        description: activityLogs.description
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .leftJoin(projects, eq(activityLogs.projectId, projects.id))
      .orderBy(desc(activityLogs.createdAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query;

    // Convert to CSV
    const csvHeaders = ['Timestamp', 'User', 'Project', 'Action Type', 'Description'];
    const csvRows = logs.map(log => [
      log.timestamp?.toISOString() || '',
      log.user || '',
      log.project || '',
      log.actionType || '',
      `"${(log.description || '').replace(/"/g, '""')}"` // Escape quotes
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('❌ Activity logs CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export activity logs'
    });
  }
});

module.exports = router;