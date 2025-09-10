// Invoice API Routes with NaN bug fixes and auto-numbering
// Handles both Global and Project-specific invoice operations

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { db, invoices, documentCounters } = require('../database');
const { eq, and, desc, sql } = require('drizzle-orm');

// Helper function to generate invoice numbers
async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  
  try {
    // Atomic upsert operation to avoid race conditions
    const result = await db
      .insert(documentCounters)
      .values({ 
        year: currentYear, 
        invoiceCounter: 1,
        variationCounter: 0,
        approvalCounter: 0,
        ticketCounter: 0
      })
      .onConflictDoUpdate({
        target: documentCounters.year,
        set: { 
          invoiceCounter: sql`${documentCounters.invoiceCounter} + 1`,
          updatedAt: new Date()
        }
      })
      .returning();
    
    const counter = result[0].invoiceCounter;
    return `INV-${currentYear}-${counter.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw new Error('Failed to generate invoice number');
  }
}

// Helper function to safely parse numeric values and prevent NaN
function safeParseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to calculate invoice totals
function calculateInvoiceTotals(lineItems) {
  if (!Array.isArray(lineItems)) {
    return { subtotal: 0, taxTotal: 0, total: 0 };
  }
  
  let subtotal = 0;
  let taxTotal = 0;
  
  const processedItems = lineItems.map(item => {
    const quantity = safeParseNumber(item.quantity, 0);
    const rate = safeParseNumber(item.rate, 0);
    const taxPercent = safeParseNumber(item.taxPercent, 0);
    
    const lineTotal = quantity * rate;
    const lineTax = lineTotal * (taxPercent / 100);
    
    subtotal += lineTotal;
    taxTotal += lineTax;
    
    return {
      ...item,
      quantity,
      rate,
      taxPercent,
      amount: lineTotal
    };
  });
  
  const total = subtotal + taxTotal;
  
  return {
    processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

// GET /api/invoices - Get all invoices (Global)
router.get('/', async (req, res) => {
  try {
    const allInvoices = await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
    
    res.json({
      success: true,
      data: allInvoices,
      count: allInvoices.length
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// GET /api/invoices/project/:projectId - Get invoices for specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.projectId, projectId))
      .orderBy(desc(invoices.createdAt));
    
    res.json({
      success: true,
      data: projectInvoices,
      count: projectInvoices.length
    });
  } catch (error) {
    console.error('Error fetching project invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project invoices'
    });
  }
});

// POST /api/invoices - Create new invoice
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      issueDate,
      dueDate,
      currency = 'USD',
      lineItems = [],
      notes
    } = req.body;
    
    // Validate required fields
    if (!projectId || !issueDate || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, issueDate, dueDate'
      });
    }
    
    // Generate invoice number
    const number = await generateInvoiceNumber();
    
    // Calculate totals with NaN protection
    const { processedItems, subtotal, taxTotal, total } = calculateInvoiceTotals(lineItems);
    
    // Create invoice
    const newInvoice = await db
      .insert(invoices)
      .values({
        id: crypto.randomUUID(),
        projectId,
        number,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency,
        lineItems: processedItems,
        subtotal: subtotal.toString(),
        taxTotal: taxTotal.toString(),
        total: total.toString(),
        status: 'Draft',
        notes
      })
      .returning();
    
    res.status(201).json({
      success: true,
      data: newInvoice[0],
      message: `Invoice ${number} created successfully`
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      issueDate,
      dueDate,
      currency,
      lineItems,
      notes,
      status
    } = req.body;
    
    // Calculate totals if lineItems provided
    let updateData = {
      updatedAt: new Date()
    };
    
    if (issueDate) updateData.issueDate = new Date(issueDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (currency) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    
    if (lineItems) {
      const { processedItems, subtotal, taxTotal, total } = calculateInvoiceTotals(lineItems);
      updateData.lineItems = processedItems;
      updateData.subtotal = subtotal.toString();
      updateData.taxTotal = taxTotal.toString();
      updateData.total = total.toString();
    }
    
    const updatedInvoice = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    
    if (updatedInvoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedInvoice[0],
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice'
    });
  }
});

// POST /api/invoices/:id/send - Send invoice
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedInvoice = await db
      .update(invoices)
      .set({
        status: 'Sent',
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    
    if (updatedInvoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    // TODO: Implement email sending logic here
    
    res.json({
      success: true,
      data: updatedInvoice[0],
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invoice'
    });
  }
});

// POST /api/invoices/:id/payment - Record payment
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, paymentAmount } = req.body;
    
    const updatedInvoice = await db
      .update(invoices)
      .set({
        status: 'Paid',
        paidAt: paymentDate ? new Date(paymentDate) : new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    
    if (updatedInvoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedInvoice[0],
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment'
    });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedInvoice = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();
    
    if (deletedInvoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice'
    });
  }
});

module.exports = router;