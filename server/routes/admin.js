// Admin routes for seeding demo data
const express = require('express');
const router = express.Router();
const { db, projects, clients, users, milestones, invoices, variationRequests, tickets } = require('../database');

// Admin seed flag (set to false in production)
const ALLOW_SEED = process.env.NODE_ENV !== 'production';

// GET /admin/seed-demo - Seed demo data
router.get('/admin/seed-demo', async (req, res) => {
  if (!ALLOW_SEED) {
    return res.status(403).json({ 
      error: 'seed_disabled', 
      message: 'Demo seeding is disabled in production' 
    });
  }

  try {
    console.log('🌱 Seeding demo projects...');
    
    // Create demo clients
    const clientIds = [];
    const clientData = [
      {
        name: 'Henderson Family Trust',
        email: 'contact@hendersonfamily.com',
        phone: '+1 (555) 123-4567',
        company: 'Henderson Family Trust',
        address: '123 Luxury Lane, Beverly Hills, CA 90210'
      },
      {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@email.com',
        phone: '+1 (555) 234-5678',
        company: 'Mitchell Properties',
        address: '456 Downtown Ave, New York, NY 10001'
      },
      {
        name: 'TechFlow Solutions',
        email: 'projects@techflow.com',
        phone: '+1 (555) 345-6789',
        company: 'TechFlow Solutions Inc.',
        address: '789 Innovation Dr, San Francisco, CA 94105'
      }
    ];

    for (const client of clientData) {
      const result = await db.insert(clients).values(client).returning();
      clientIds.push(result[0].id);
    }

    // Create demo projects with sequential IDs
    const projectData = [
      {
        clientId: clientIds[0],
        title: 'Luxury Villa Renovation',
        description: 'Complete renovation of a luxury villa with modern interior design and smart home integration.',
        status: 'In Progress',
        priority: 'High',
        budget: '280000.00',
        spent: '182000.00',
        progress: 65,
        startDate: new Date('2024-01-15'),
        targetDate: new Date('2025-08-30')
      },
      {
        clientId: clientIds[1],
        title: 'Modern Downtown Loft',
        description: 'Contemporary loft design with open concept living and industrial elements.',
        status: 'In Progress',
        priority: 'Medium',
        budget: '150000.00',
        spent: '102000.00',
        progress: 68,
        startDate: new Date('2024-03-01'),
        targetDate: new Date('2025-05-15')
      },
      {
        clientId: clientIds[2],
        title: 'Corporate Office Design',
        description: 'Modern office space design for technology company with collaborative areas.',
        status: 'On Hold',
        priority: 'Medium',
        budget: '320000.00',
        spent: '144000.00',
        progress: 45,
        startDate: new Date('2024-02-10'),
        targetDate: new Date('2025-09-20')
      }
    ];

    const projectIds = [];
    for (const project of projectData) {
      const result = await db.insert(projects).values(project).returning();
      projectIds.push(result[0].id);
    }

    console.log(`✅ Seeded ${projectIds.length} demo projects`);

    res.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        clientsCreated: clientIds.length,
        projectsCreated: projectIds.length,
        projectIds: projectIds
      }
    });

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    
    // Even seeding errors should not crash the app
    res.status(200).json({
      error: 'seed_failed',
      message: 'Failed to seed demo data',
      details: error.message
    });
  }
});

module.exports = router;