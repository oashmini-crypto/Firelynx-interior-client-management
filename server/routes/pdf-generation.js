// PDF Generation Service with Branded Layouts
// Professional PDF generation for invoices, variations, and approvals

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { db, brandingSettings, invoices, variationRequests, approvalPackets } = require('../database');
const { eq } = require('drizzle-orm');

// Helper function to get branding settings
async function getBrandingSettings() {
  const settings = await db
    .select()
    .from(brandingSettings)
    .limit(1);
  
  return settings[0] || {
    appName: 'FireLynx',
    logoUrl: null,
    accentColor: '#4C6FFF',
    primaryTextColor: '#0F172A',
    mutedTextColor: '#64748B',
    borderColor: '#E2E8F0',
    bgSoft: '#F8FAFC',
    fontFamily: 'Helvetica',
    footerLeft: 'FireLynx Interior Design Studio',
    footerRight: 'support@firelynx.com • +1 (555) 123-4567',
    watermarkEnabled: false,
    watermarkText: 'DRAFT',
    watermarkOpacity: '0.08'
  };
}

// Helper function to add watermark
function addWatermark(doc, settings) {
  if (!settings.watermarkEnabled) return;
  
  const opacity = parseFloat(settings.watermarkOpacity) || 0.08;
  
  doc.save();
  doc.rotate(45, { origin: [300, 400] });
  doc.fontSize(60);
  doc.fillOpacity(opacity);
  doc.fillColor('#000000');
  doc.text(settings.watermarkText, 150, 350, {
    align: 'center',
    width: 400
  });
  doc.restore();
}

// Helper function to add header with logo and branding
async function addBrandedHeader(doc, settings, documentTitle, documentNumber) {
  const headerY = 50;
  const logoSize = 60;
  
  // Add logo if available
  if (settings.logoUrl && fs.existsSync(path.join('.', settings.logoUrl))) {
    try {
      doc.image(path.join('.', settings.logoUrl), 50, headerY, {
        width: logoSize,
        height: logoSize,
        fit: [logoSize, logoSize]
      });
    } catch (error) {
      console.log('Could not load logo, continuing without it...');
    }
  }
  
  // Company name
  doc.fontSize(24)
     .fillColor(settings.primaryTextColor)
     .text(settings.appName, 130, headerY + 5);
  
  // Document title and number (right aligned)
  doc.fontSize(20)
     .fillColor(settings.accentColor)
     .text(documentTitle, 350, headerY, { align: 'right', width: 200 });
  
  doc.fontSize(16)
     .fillColor(settings.primaryTextColor)
     .text(documentNumber, 350, headerY + 25, { align: 'right', width: 200 });
  
  // Header line
  doc.moveTo(50, headerY + 80)
     .lineTo(550, headerY + 80)
     .stroke(settings.borderColor);
  
  return headerY + 100; // Return Y position after header
}

// Helper function to add footer
function addBrandedFooter(doc, settings) {
  const footerY = 720;
  
  // Footer line
  doc.moveTo(50, footerY)
     .lineTo(550, footerY)
     .stroke(settings.borderColor);
  
  // Footer text
  doc.fontSize(10)
     .fillColor(settings.mutedTextColor)
     .text(settings.footerLeft, 50, footerY + 10);
  
  doc.text(settings.footerRight, 350, footerY + 10, { 
    align: 'right', 
    width: 200 
  });
  
  // Page numbers
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(9)
       .fillColor(settings.mutedTextColor)
       .text(`Page ${i + 1} of ${pageCount}`, 50, footerY + 25, {
         align: 'center',
         width: 500
       });
  }
}

// POST /api/pdf/invoice/:invoiceId - Generate branded invoice PDF (LEGACY - Use pdf-html.js instead)
router.post('/invoice/:invoiceId-legacy', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Get invoice data
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    
    if (invoice.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    const invoiceData = invoice[0];
    const settings = await getBrandingSettings();
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.number}.pdf"`);
    
    // Pipe the PDF to response
    doc.pipe(res);
    
    // Add watermark
    addWatermark(doc, settings);
    
    // Add header
    const currentY = await addBrandedHeader(doc, settings, 'INVOICE', invoiceData.number);
    let yPosition = currentY + 20;
    
    // Invoice details section
    doc.fontSize(12)
       .fillColor(settings.primaryTextColor);
    
    // Date information
    doc.text('Issue Date:', 50, yPosition);
    doc.text(new Date(invoiceData.issueDate).toLocaleDateString(), 150, yPosition);
    
    doc.text('Due Date:', 300, yPosition);
    doc.text(new Date(invoiceData.dueDate).toLocaleDateString(), 400, yPosition);
    
    yPosition += 30;
    
    // Status
    doc.fontSize(14)
       .fillColor(
         invoiceData.status === 'Paid' ? '#10B981' :
         invoiceData.status === 'Overdue' ? '#EF4444' : settings.accentColor
       )
       .text(`Status: ${invoiceData.status}`, 50, yPosition);
    
    yPosition += 40;
    
    // Line items table
    doc.fontSize(12)
       .fillColor(settings.primaryTextColor)
       .text('INVOICE ITEMS', 50, yPosition);
    
    yPosition += 25;
    
    // Table header
    doc.rect(50, yPosition, 500, 25)
       .fill(settings.bgSoft);
    
    doc.fontSize(10)
       .fillColor(settings.primaryTextColor)
       .text('#', 60, yPosition + 8)
       .text('Description', 90, yPosition + 8)
       .text('Qty', 320, yPosition + 8)
       .text('Rate', 370, yPosition + 8)
       .text('Tax %', 420, yPosition + 8)
       .text('Total', 470, yPosition + 8);
    
    yPosition += 25;
    
    // Line items
    const lineItems = Array.isArray(invoiceData.lineItems) ? invoiceData.lineItems : [];
    lineItems.forEach((item, index) => {
      const rowY = yPosition + (index * 20);
      
      // Alternate row background
      if (index % 2 === 1) {
        doc.rect(50, rowY, 500, 20)
           .fill('#F9FAFB');
      }
      
      doc.fontSize(9)
         .fillColor(settings.primaryTextColor)
         .text((index + 1).toString(), 60, rowY + 5)
         .text(item.description || '', 90, rowY + 5, { width: 220 })
         .text((item.quantity || 0).toString(), 320, rowY + 5)
         .text(`$${(item.rate || 0).toFixed(2)}`, 370, rowY + 5)
         .text(`${(item.taxPercent || 0).toFixed(1)}%`, 420, rowY + 5)
         .text(`$${(item.amount || 0).toFixed(2)}`, 470, rowY + 5);
    });
    
    yPosition += (lineItems.length * 20) + 30;
    
    // Totals section
    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    const taxTotal = parseFloat(invoiceData.taxTotal) || 0;
    const total = parseFloat(invoiceData.total) || 0;
    
    doc.fontSize(11)
       .fillColor(settings.primaryTextColor);
    
    doc.text('Subtotal:', 400, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, 470, yPosition);
    
    doc.text('Tax Total:', 400, yPosition + 15);
    doc.text(`$${taxTotal.toFixed(2)}`, 470, yPosition + 15);
    
    // Grand total
    doc.fontSize(14)
       .fillColor(settings.accentColor);
    doc.text('TOTAL:', 400, yPosition + 35);
    doc.text(`$${total.toFixed(2)}`, 470, yPosition + 35);
    
    // Notes section
    if (invoiceData.notes) {
      yPosition += 80;
      doc.fontSize(12)
         .fillColor(settings.primaryTextColor)
         .text('NOTES', 50, yPosition);
      
      doc.fontSize(10)
         .fillColor(settings.mutedTextColor)
         .text(invoiceData.notes, 50, yPosition + 20, { width: 500 });
    }
    
    // Add footer
    addBrandedFooter(doc, settings);
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate invoice PDF'
    });
  }
});

// POST /api/pdf/variation/:variationId - Generate branded variation request PDF  
router.post('/variation/:variationId', async (req, res) => {
  try {
    const { variationId } = req.params;
    
    // Get variation data
    const variation = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, variationId))
      .limit(1);
    
    if (variation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    const variationData = variation[0];
    const settings = await getBrandingSettings();
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${variationData.number}.pdf"`);
    
    // Pipe the PDF to response
    doc.pipe(res);
    
    // Add watermark
    addWatermark(doc, settings);
    
    // Add header
    const currentY = await addBrandedHeader(doc, settings, 'VARIATION REQUEST', variationData.number);
    let yPosition = currentY + 20;
    
    // Request info section
    doc.fontSize(12)
       .fillColor(settings.primaryTextColor);
    
    doc.text('Date:', 50, yPosition);
    doc.text(new Date(variationData.date).toLocaleDateString(), 150, yPosition);
    
    doc.text('Status:', 300, yPosition);
    doc.text(variationData.status, 400, yPosition);
    
    yPosition += 25;
    
    doc.text('Requestor:', 50, yPosition);
    doc.text(variationData.changeRequestor, 150, yPosition);
    
    doc.text('Reference:', 300, yPosition);
    doc.text(variationData.changeReference || 'N/A', 400, yPosition);
    
    yPosition += 25;
    
    doc.text('Change Area:', 50, yPosition);
    doc.text(variationData.changeArea, 150, yPosition);
    
    yPosition += 40;
    
    // Work Types section
    doc.fontSize(14)
       .fillColor(settings.accentColor)
       .text('WORK TYPES', 50, yPosition);
    
    yPosition += 25;
    
    const workTypes = ['Joinery', 'Electrical', 'Plumbing', 'Flooring', 'Painting', 'Demolition'];
    const selectedWorkTypes = variationData.workTypes || [];
    
    workTypes.forEach((workType, index) => {
      const x = 50 + (index % 2) * 250;
      const y = yPosition + Math.floor(index / 2) * 20;
      
      const isSelected = selectedWorkTypes.includes(workType);
      
      // Checkbox
      doc.rect(x, y, 12, 12)
         .stroke(settings.borderColor);
      
      if (isSelected) {
        doc.fontSize(10)
           .fillColor(settings.accentColor)
           .text('✓', x + 2, y + 1);
      }
      
      // Label
      doc.fontSize(11)
         .fillColor(settings.primaryTextColor)
         .text(workType, x + 20, y + 2);
    });
    
    yPosition += Math.ceil(workTypes.length / 2) * 20 + 30;
    
    // Categories section
    doc.fontSize(14)
       .fillColor(settings.accentColor)
       .text('CATEGORIES', 50, yPosition);
    
    yPosition += 25;
    
    const categories = ['Scope', 'Cost', 'Quality', 'Timeline', 'Resources'];
    const selectedCategories = variationData.categories || [];
    
    categories.forEach((category, index) => {
      const x = 50 + (index % 3) * 150;
      const y = yPosition + Math.floor(index / 3) * 20;
      
      const isSelected = selectedCategories.includes(category);
      
      // Checkbox
      doc.rect(x, y, 12, 12)
         .stroke(settings.borderColor);
      
      if (isSelected) {
        doc.fontSize(10)
           .fillColor(settings.accentColor)
           .text('✓', x + 2, y + 1);
      }
      
      // Label
      doc.fontSize(11)
         .fillColor(settings.primaryTextColor)
         .text(category, x + 20, y + 2);
    });
    
    yPosition += Math.ceil(categories.length / 3) * 20 + 30;
    
    // Description sections
    const sections = [
      { title: 'CHANGE DESCRIPTION', content: variationData.changeDescription },
      { title: 'REASON FOR CHANGE', content: variationData.reasonDescription },
      { title: 'TECHNICAL CHANGES', content: variationData.technicalChanges },
      { title: 'RESOURCES & COSTS', content: variationData.resourcesAndCosts }
    ];
    
    sections.forEach(section => {
      if (section.content) {
        doc.fontSize(12)
           .fillColor(settings.accentColor)
           .text(section.title, 50, yPosition);
        
        yPosition += 20;
        
        doc.fontSize(10)
           .fillColor(settings.primaryTextColor)
           .text(section.content, 50, yPosition, { width: 500 });
        
        yPosition += doc.heightOfString(section.content, { width: 500 }) + 25;
      }
    });
    
    // Disposition section
    if (variationData.disposition) {
      doc.fontSize(14)
         .fillColor(settings.accentColor)
         .text('DISPOSITION', 50, yPosition);
      
      yPosition += 25;
      
      const dispositions = ['Approve', 'Reject', 'Defer'];
      dispositions.forEach((disp, index) => {
        const x = 50 + index * 100;
        const isSelected = variationData.disposition === disp;
        
        // Radio button
        doc.circle(x + 6, yPosition + 6, 6)
           .stroke(settings.borderColor);
        
        if (isSelected) {
          doc.circle(x + 6, yPosition + 6, 3)
             .fill(settings.accentColor);
        }
        
        // Label
        doc.fontSize(11)
           .fillColor(settings.primaryTextColor)
           .text(disp, x + 20, yPosition + 2);
      });
      
      if (variationData.dispositionReason) {
        yPosition += 35;
        doc.fontSize(10)
           .fillColor(settings.primaryTextColor)
           .text('Reason:', 50, yPosition);
        
        yPosition += 15;
        doc.text(variationData.dispositionReason, 50, yPosition, { width: 500 });
      }
    }
    
    // Add footer
    addBrandedFooter(doc, settings);
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating variation PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate variation PDF'
    });
  }
});

// POST /api/pdf/approval/:approvalId - Generate approval certificate PDF
router.post('/approval/:approvalId', async (req, res) => {
  try {
    const { approvalId } = req.params;
    
    // Get approval data
    const approval = await db
      .select()
      .from(approvalPackets)
      .where(eq(approvalPackets.id, approvalId))
      .limit(1);
    
    if (approval.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Approval not found'
      });
    }
    
    const approvalData = approval[0];
    const settings = await getBrandingSettings();
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${approvalData.number}_certificate.pdf"`);
    
    // Pipe the PDF to response
    doc.pipe(res);
    
    // Add watermark
    addWatermark(doc, settings);
    
    // Add header
    const currentY = await addBrandedHeader(doc, settings, 'APPROVAL CERTIFICATE', approvalData.number);
    let yPosition = currentY + 20;
    
    // Certificate content
    doc.fontSize(16)
       .fillColor(settings.accentColor)
       .text('CERTIFICATE OF APPROVAL', 50, yPosition, { align: 'center', width: 500 });
    
    yPosition += 50;
    
    doc.fontSize(12)
       .fillColor(settings.primaryTextColor)
       .text('This certifies that the following approval request has been processed:', 50, yPosition, { width: 500 });
    
    yPosition += 40;
    
    // Approval details
    doc.text('Title:', 50, yPosition);
    doc.text(approvalData.title, 150, yPosition, { width: 350 });
    
    yPosition += 25;
    
    if (approvalData.description) {
      doc.text('Description:', 50, yPosition);
      yPosition += 15;
      doc.text(approvalData.description, 50, yPosition, { width: 500 });
      yPosition += doc.heightOfString(approvalData.description, { width: 500 }) + 20;
    }
    
    doc.text('Status:', 50, yPosition);
    doc.fillColor(approvalData.status === 'Approved' ? '#10B981' : '#EF4444')
       .text(approvalData.status, 150, yPosition);
    
    yPosition += 25;
    
    if (approvalData.decidedAt) {
      doc.fillColor(settings.primaryTextColor)
         .text('Decision Date:', 50, yPosition);
      doc.text(new Date(approvalData.decidedAt).toLocaleDateString(), 150, yPosition);
      yPosition += 25;
    }
    
    if (approvalData.clientComment) {
      doc.text('Client Comments:', 50, yPosition);
      yPosition += 15;
      doc.text(approvalData.clientComment, 50, yPosition, { width: 500 });
      yPosition += doc.heightOfString(approvalData.clientComment, { width: 500 }) + 25;
    }
    
    if (approvalData.signatureName) {
      yPosition += 40;
      doc.text('Approved by:', 50, yPosition);
      doc.fontSize(14)
         .text(approvalData.signatureName, 150, yPosition);
    }
    
    // Add footer
    addBrandedFooter(doc, settings);
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating approval certificate PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate approval certificate PDF'
    });
  }
});

module.exports = router;