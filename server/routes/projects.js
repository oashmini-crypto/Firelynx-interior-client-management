// Project Management API Routes

const express = require('express');
const router = express.Router();
const { db, projects, clients } = require('../database');
const { eq, desc } = require('drizzle-orm');

// Mock data fallback for when database is unavailable
const mockProjects = [
  {
    id: 'PRJ-2025-001',
    title: 'Luxury Villa Renovation',
    description: 'Complete renovation of a luxury villa with modern interior design and smart home integration.',
    status: 'In Progress',
    priority: 'High',
    budget: '280000.00',
    spent: '182000.00',
    progress: 65,
    startDate: new Date('2024-01-15'),
    targetDate: new Date('2025-08-30'),
    completedDate: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    clientName: 'Henderson Family Trust',
    clientEmail: 'contact@hendersonfamily.com',
    clientCompany: 'Henderson Family Trust'
  },
  {
    id: 'PRJ-2025-002', 
    title: 'Modern Downtown Loft',
    description: 'Contemporary loft design with open concept living and industrial elements.',
    status: 'In Progress',
    priority: 'Medium',
    budget: '150000.00',
    spent: '102000.00',
    progress: 68,
    startDate: new Date('2024-03-01'),
    targetDate: new Date('2025-05-15'),
    completedDate: null,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    clientName: 'Sarah Mitchell',
    clientEmail: 'sarah.mitchell@email.com',
    clientCompany: 'Mitchell Properties'
  },
  {
    id: 'PRJ-2025-003',
    title: 'Corporate Office Design',
    description: 'Modern office space design for technology company with collaborative areas.',
    status: 'On Hold',
    priority: 'Medium',
    budget: '320000.00',
    spent: '144000.00',
    progress: 45,
    startDate: new Date('2024-02-10'),
    targetDate: new Date('2025-09-20'),
    completedDate: null,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(),
    clientName: 'TechFlow Solutions',
    clientEmail: 'projects@techflow.com',
    clientCompany: 'TechFlow Solutions Inc.'
  }
];

// GET /api/projects - Get all projects (NEVER throws 500)
router.get('/', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 GET /api/projects - Request received');
  }
  
  try {
    // Try to fetch from database
    const allProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        budget: projects.budget,
        spent: projects.spent,
        progress: projects.progress,
        startDate: projects.startDate,
        targetDate: projects.targetDate,
        completedDate: projects.completedDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientName: clients.name,
        clientEmail: clients.email,
        clientCompany: clients.company
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(projects.createdAt));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Successfully fetched ${allProjects.length} projects from database`);
    }
    
    res.status(200).json({
      success: true,
      data: allProjects,
      count: allProjects.length,
      source: 'database'
    });
  } catch (dbError) {
    // Log the full error for debugging - development only to prevent information leakage
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Database error in /api/projects:', {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      
      console.log('🔄 Using mock data fallback due to database error');
    }
    
    // ALWAYS return 200 with fallback data to prevent UI crash
    
    res.status(200).json({
      success: true,
      data: mockProjects,
      count: mockProjects.length,
      meta: {
        warning: 'db_unavailable',
        message: 'Using demo data - database temporarily unavailable',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        budget: projects.budget,
        spent: projects.spent,
        progress: projects.progress,
        startDate: projects.startDate,
        targetDate: projects.targetDate,
        completedDate: projects.completedDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientId: clients.id,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        clientCompany: clients.company,
        clientAddress: clients.address
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, id))
      .limit(1);
    
    if (project.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project[0]
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching project:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const {
      clientId,
      title,
      description,
      status = 'Planning',
      priority = 'Medium',
      budget,
      startDate,
      targetDate
    } = req.body;
    
    if (!clientId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, title'
      });
    }
    
    const newProject = await db
      .insert(projects)
      .values({
        clientId,
        title,
        description,
        status,
        priority,
        budget: budget ? budget.toString() : null,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null
      })
      .returning();
    
    res.status(201).json({
      success: true,
      data: newProject[0],
      message: 'Project created successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating project:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    // Convert budget to string if provided
    if (updateData.budget) {
      updateData.budget = updateData.budget.toString();
    }
    
    // Convert dates
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.targetDate) {
      updateData.targetDate = new Date(updateData.targetDate);
    }
    if (updateData.completedDate) {
      updateData.completedDate = new Date(updateData.completedDate);
    }
    
    const updatedProject = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    
    if (updatedProject.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedProject[0],
      message: 'Project updated successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating project:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProject = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    if (deletedProject.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedProject[0],
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting project:', error);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

module.exports = router;