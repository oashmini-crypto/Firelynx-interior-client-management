// Variation Request API Routes with Multi-select Support

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { db, variationRequests, documentCounters } = require('../database');
const { eq, desc } = require('drizzle-orm');

// Helper function to generate variation numbers
async function generateVariationNumber() {
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
        .values({ year: currentYear, variationCounter: 1 })
        .returning();
      counter = 1;
    } else {
      const updatedCounter = await db
        .update(documentCounters)
        .set({ 
          variationCounter: counterResult[0].variationCounter + 1,
          updatedAt: new Date()
        })
        .where(eq(documentCounters.year, currentYear))
        .returning();
      counter = updatedCounter[0].variationCounter;
    }
    
    return `VR-${currentYear}-${counter.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating variation number:', error);
    throw new Error('Failed to generate variation number');
  }
}

// GET /api/variations - Get all variations (Global)
router.get('/', async (req, res) => {
  try {
    const allVariations = await db
      .select()
      .from(variationRequests)
      .orderBy(desc(variationRequests.createdAt));
    
    res.json({
      success: true,
      data: allVariations,
      count: allVariations.length
    });
  } catch (error) {
    console.error('Error fetching variations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variations'
    });
  }
});

// GET /api/variations/project/:projectId - Get variations for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectVariations = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.projectId, projectId))
      .orderBy(desc(variationRequests.createdAt));
    
    res.json({
      success: true,
      data: projectVariations,
      count: projectVariations.length
    });
  } catch (error) {
    console.error('Error fetching project variations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project variations'
    });
  }
});

// GET /api/variations/:id - Get single variation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const variation = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, id))
      .limit(1);
    
    if (variation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation not found'
      });
    }
    
    res.json({
      success: true,
      data: variation[0]
    });
  } catch (error) {
    console.error('Error fetching variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variation'
    });
  }
});

// Helper function for AED formatting
function formatAED(amount) {
  return `AED ${parseFloat(amount || 0).toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// POST /api/variations - Create new variation request
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      changeRequestor,
      changeReference,
      changeArea,
      workTypes = [],
      categories = [],
      changeDescription,
      reasonDescription,
      technicalChanges,
      resourcesAndCosts,
      attachments = [],
      // Enhanced cost structure for Dubai projects
      materialCosts = [],
      laborCosts = [],
      additionalCosts = [],
      currency = 'AED',
      title,
      description,
      category,
      priority = 'medium',
      justification,
      timeImpact = 0,
      priceImpact = 0
    } = req.body;
    
    // Accept both old and new form formats for backward compatibility
    const hasOldFormat = changeRequestor && changeArea && changeDescription && reasonDescription;
    const hasNewFormat = title && description && category && justification;
    
    if (!projectId || (!hasOldFormat && !hasNewFormat)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Either provide old format (changeRequestor, changeArea, changeDescription, reasonDescription) or new format (title, description, category, justification)'
      });
    }
    
    // Calculate total cost from detailed breakdown
    const materialTotal = Array.isArray(materialCosts) ? materialCosts.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) : 0;
    const laborTotal = Array.isArray(laborCosts) ? laborCosts.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) : 0;
    const additionalTotal = Array.isArray(additionalCosts) ? additionalCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) : 0;
    const calculatedPriceImpact = materialTotal + laborTotal + additionalTotal;
    
    // Generate variation number
    const number = await generateVariationNumber();
    
    // Create variation request with enhanced cost structure
    const variationData = {
      id: crypto.randomUUID(),
      projectId,
      number,
      date: new Date(),
      // Support both old and new formats
      changeRequestor: changeRequestor || 'Manager',
      changeReference: changeReference || number,
      changeArea: changeArea || category || 'General',
      workTypes: JSON.stringify(workTypes || []),
      categories: JSON.stringify(categories || []),
      changeDescription: changeDescription || description,
      reasonDescription: reasonDescription || justification,
      technicalChanges: technicalChanges || '',
      resourcesAndCosts: resourcesAndCosts || `Material Costs: ${formatAED(materialTotal)}, Labor Costs: ${formatAED(laborTotal)}, Additional Costs: ${formatAED(additionalTotal)}, Total: ${formatAED(calculatedPriceImpact)}`,
      status: req.body.status || 'Pending',
      attachments: JSON.stringify(attachments),
      // Enhanced cost fields (stored as JSON for flexibility)
      materialCosts: JSON.stringify(materialCosts),
      laborCosts: JSON.stringify(laborCosts), 
      additionalCosts: JSON.stringify(additionalCosts),
      currency: currency,
      title: title || changeDescription,
      priority: priority,
      priceImpact: calculatedPriceImpact || priceImpact,
      timeImpact: timeImpact || 0
    };
    
    const newVariation = await db
      .insert(variationRequests)
      .values(variationData)
      .returning();
      
    
    res.status(201).json({
      success: true,
      data: newVariation[0],
      message: `Variation request ${number} created successfully`
    });
  } catch (error) {
    console.error('Error creating variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create variation request'
    });
  }
});

// PUT /api/variations/:id - Update variation request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    // Serialize arrays to JSON
    if (updateData.workTypes) {
      updateData.workTypes = JSON.stringify(updateData.workTypes);
    }
    if (updateData.categories) {
      updateData.categories = JSON.stringify(updateData.categories);
    }
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    
    const updatedVariation = await db
      .update(variationRequests)
      .set(updateData)
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (updatedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedVariation[0],
      message: 'Variation request updated successfully'
    });
  } catch (error) {
    console.error('Error updating variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update variation request'
    });
  }
});

// POST /api/variations/:id/disposition - Update disposition
router.post('/:id/disposition', async (req, res) => {
  try {
    const { id } = req.params;
    const { disposition, dispositionReason, status } = req.body;
    
    if (!['Approve', 'Reject', 'Defer'].includes(disposition)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid disposition. Must be "Approve", "Reject", or "Defer"'
      });
    }
    
    const updatedVariation = await db
      .update(variationRequests)
      .set({
        disposition,
        dispositionReason,
        status: status || (disposition === 'Approve' ? 'Approved' : disposition === 'Reject' ? 'Rejected' : 'Under Review'),
        updatedAt: new Date()
      })
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (updatedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedVariation[0],
      message: `Variation request disposition set to ${disposition}`
    });
  } catch (error) {
    console.error('Error updating variation disposition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update variation disposition'
    });
  }
});

// DELETE /api/variations/:id - Delete variation request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedVariation = await db
      .delete(variationRequests)
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (deletedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Variation request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete variation request'
    });
  }
});

// GET /api/variations/options - Get work types and categories options
router.get('/options', async (req, res) => {
  try {
    const options = {
      workTypes: [
        'Joinery',
        'Electrical', 
        'Plumbing',
        'Flooring',
        'Painting',
        'Demolition',
        'Structural',
        'HVAC',
        'Lighting',
        'Tiling'
      ],
      categories: [
        'Scope',
        'Cost', 
        'Quality',
        'Timeline',
        'Resources',
        'Materials',
        'Design',
        'Safety',
        'Compliance'
      ]
    };
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching variation options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variation options'
    });
  }
});

// Demo data creation function for Dubai project variations
async function createDemoVariationData() {
  try {
    // Get the first project (assumed to be Dubai project)
    const existingVariations = await db
      .select()
      .from(variationRequests)
      .limit(1);
    
    // Only create demo data if none exists
    if (existingVariations.length > 0) {
      return;
    }

    // Get projects to use for demo data
    const { projects } = require('../database');
    const projectList = await db.select().from(projects).limit(1);
    
    if (projectList.length === 0) {
      console.log('No projects found for demo variation data');
      return;
    }

    const projectId = projectList[0].id;
    
    // Demo Variation 1: Kitchen Upgrade
    const kitchenVariationData = {
      id: `var-${Date.now()}-1`,
      projectId,
      number: 'VR-2025-0001',
      date: new Date(),
      changeRequestor: 'Client - Sarah Mitchell',
      changeReference: 'VR-2025-0001',
      changeArea: 'Kitchen',
      workTypes: JSON.stringify(['Joinery', 'Electrical', 'Plumbing']),
      categories: JSON.stringify(['Material Upgrade', 'Design Change']),
      changeDescription: 'Upgrade kitchen countertops to Italian marble and add premium lighting fixtures',
      reasonDescription: 'Client wants enhanced luxury finishes for the kitchen area to match Dubai premium standards',
      technicalChanges: 'Replace granite with Calacatta marble, install LED strip lighting with dimmer controls',
      resourcesAndCosts: 'Material Costs: AED 15,750.00, Labor Costs: AED 4,200.00, Additional Costs: AED 1,050.00, Total: AED 21,000.00',
      status: 'Pending',
      attachments: JSON.stringify([]),
      materialCosts: JSON.stringify([
        { description: 'Calacatta Marble Slabs', quantity: 12, unitRate: 850, total: 10200 },
        { description: 'Premium Edge Finishing', quantity: 15, unitRate: 120, total: 1800 },
        { description: 'LED Strip Lighting Kit', quantity: 8, unitRate: 320, total: 2560 },
        { description: 'Dimmer Control Systems', quantity: 3, unitRate: 396.67, total: 1190 }
      ]),
      laborCosts: JSON.stringify([
        { description: 'Marble Installation Specialist', hours: 16, hourlyRate: 150, total: 2400 },
        { description: 'Electrical Work for Lighting', hours: 12, hourlyRate: 125, total: 1500 },
        { description: 'Finishing and Polish', hours: 8, hourlyRate: 37.50, total: 300 }
      ]),
      additionalCosts: JSON.stringify([
        { category: 'Transportation', description: 'Marble delivery and handling', amount: 850 },
        { category: 'Equipment', description: 'Specialized cutting tools rental', amount: 200 }
      ]),
      currency: 'AED',
      title: 'Premium Kitchen Countertop and Lighting Upgrade',
      priority: 'high',
      priceImpact: 21000,
      timeImpact: 5
    };

    // Demo Variation 2: Bathroom Addition
    const bathroomVariationData = {
      id: `var-${Date.now()}-2`,
      projectId,
      number: 'VR-2025-0002',
      date: new Date(Date.now() - 24*60*60*1000), // Yesterday
      changeRequestor: 'Project Manager',
      changeReference: 'VR-2025-0002',
      changeArea: 'Guest Bathroom',
      workTypes: JSON.stringify(['Plumbing', 'Tiling', 'Electrical']),
      categories: JSON.stringify(['Scope Addition']),
      changeDescription: 'Add luxury guest bathroom with premium fixtures and traditional Arabic design elements',
      reasonDescription: 'Client requested additional guest facilities to accommodate visitors as per Dubai hospitality standards',
      technicalChanges: 'New plumbing connections, waterproofing, Arabic mosaic tilework, premium fixtures installation',
      resourcesAndCosts: 'Material Costs: AED 28,800.00, Labor Costs: AED 12,600.00, Additional Costs: AED 3,600.00, Total: AED 45,000.00',
      status: 'Approved',
      attachments: JSON.stringify([]),
      materialCosts: JSON.stringify([
        { description: 'Arabic Mosaic Tiles (Zellige)', quantity: 45, unitRate: 280, total: 12600 },
        { description: 'Premium Bathroom Fixtures Set', quantity: 1, unitRate: 8500, total: 8500 },
        { description: 'Waterproofing Materials', quantity: 25, unitRate: 120, total: 3000 },
        { description: 'Luxury Mirror with Gold Frame', quantity: 1, unitRate: 1800, total: 1800 },
        { description: 'Traditional Brass Faucets', quantity: 2, unitRate: 1450, total: 2900 }
      ]),
      laborCosts: JSON.stringify([
        { description: 'Master Tiler (Arabic patterns)', hours: 32, hourlyRate: 200, total: 6400 },
        { description: 'Plumbing Installation', hours: 24, hourlyRate: 175, total: 4200 },
        { description: 'Electrical and Lighting', hours: 16, hourlyRate: 125, total: 2000 }
      ]),
      additionalCosts: JSON.stringify([
        { category: 'Permits', description: 'Dubai Municipality plumbing permits', amount: 1200 },
        { category: 'Design Consultation', description: 'Arabic design specialist', amount: 2400 }
      ]),
      currency: 'AED',
      title: 'Luxury Guest Bathroom Addition with Arabic Design',
      priority: 'medium',
      priceImpact: 45000,
      timeImpact: 12
    };

    // Insert demo variations
    await db.insert(variationRequests).values([kitchenVariationData, bathroomVariationData]);
    
    console.log('✅ Demo variation data created successfully with AED pricing structure');
  } catch (error) {
    console.error('Error creating demo variation data:', error);
  }
}

// Initialize demo data (run once)
createDemoVariationData();

// POST /api/variations/:id/submit - Submit variation for client approval
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedVariation = await db
      .update(variationRequests)
      .set({ 
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (updatedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    // TODO: Send notification to client about pending approval
    
    res.json({
      success: true,
      data: updatedVariation[0],
      message: `Variation ${updatedVariation[0].number} submitted for client approval`
    });
  } catch (error) {
    console.error('Error submitting variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit variation for approval'
    });
  }
});

// POST /api/variations/:id/approve - Client approves variation
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment = '' } = req.body;
    
    const updatedVariation = await db
      .update(variationRequests)
      .set({ 
        status: 'approved',
        decidedAt: new Date(),
        decidedBy: null, // Client approvals don't have an internal user ID
        clientComment: comment,
        updatedAt: new Date()
      })
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (updatedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    // TODO: Generate invoice automatically if configured
    // TODO: Send notification to manager about approval
    
    res.json({
      success: true,
      data: updatedVariation[0],
      message: `Variation ${updatedVariation[0].number} approved by client`
    });
  } catch (error) {
    console.error('Error approving variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve variation'
    });
  }
});

// POST /api/variations/:id/decline - Client declines variation
router.post('/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment = '' } = req.body;
    
    if (!comment.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment is required when declining a variation'
      });
    }
    
    const updatedVariation = await db
      .update(variationRequests)
      .set({ 
        status: 'declined',
        decidedAt: new Date(),
        decidedBy: null, // Client decisions don't have an internal user ID
        clientComment: comment,
        updatedAt: new Date()
      })
      .where(eq(variationRequests.id, id))
      .returning();
    
    if (updatedVariation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    // TODO: Send notification to manager about decline with comments
    
    res.json({
      success: true,
      data: updatedVariation[0],
      message: `Variation ${updatedVariation[0].number} declined by client`
    });
  } catch (error) {
    console.error('Error declining variation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline variation'
    });
  }
});

module.exports = router;