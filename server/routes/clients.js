// Client Management API Routes

const express = require('express');
const router = express.Router();
const { db, clients } = require('../database');
const { eq, desc } = require('drizzle-orm');
const { v4: uuidv4 } = require('uuid');

// GET /api/clients - Get all clients
router.get('/', async (req, res) => {
  console.log('📊 GET /api/clients - Request received');
  
  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
    
    console.log(`✅ Successfully fetched ${allClients.length} clients from database`);
    
    res.status(200).json({
      success: true,
      data: allClients,
      count: allClients.length
    });
  } catch (error) {
    console.error('❌ Database error in /api/clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

// GET /api/clients/:id - Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);
    
    if (client.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      data: client[0]
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client'
    });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address
    } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email'
      });
    }

    // Generate client ID
    const clientId = uuidv4();
    
    const newClient = await db
      .insert(clients)
      .values({
        id: clientId,
        name,
        email,
        phone: phone || null,
        company: company || null,
        address: address || null
      })
      .returning();
    
    res.status(201).json({
      success: true,
      data: newClient[0],
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    
    // Handle unique constraint violations (email)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'A client with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create client'
    });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { 
      ...req.body, 
      updatedAt: new Date() 
    };
    
    // Remove id if it was included in the update data
    delete updateData.id;
    
    const updatedClient = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    
    if (updatedClient.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedClient[0],
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    
    // Handle unique constraint violations (email)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'A client with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedClient = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();
    
    if (deletedClient.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedClient[0],
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
});

module.exports = router;