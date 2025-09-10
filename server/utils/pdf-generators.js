// Reliable PDF Generation using PDFKit
// Designed for Replit environment - no Puppeteer dependencies

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to format currency
function formatCurrency(amount, currency = 'AED') {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED '
  };
  const symbol = symbols[currency] || '$';
  const formatted = parseFloat(amount || 0).toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return currency === 'AED' ? `${symbol}${formatted}` : `${symbol}${formatted}`;
}

// Helper function to add branded header
function addBrandedHeader(doc, settings, documentType, documentNumber) {
  const pageWidth = 612; // A4 width in points
  const margin = 50;
  
  // Company name/logo section
  doc.fontSize(24)
     .fillColor('#4C6FFF')
     .text(settings.appName || 'FireLynx', margin, 60);
  
  // Company contact info
  doc.fontSize(10)
     .fillColor('#64748B')
     .text('123 Design Street, Creative City, CA 90210', margin, 90)
     .text('+1 (555) 123-4567 • hello@firelynx.com', margin, 105);
  
  // Document title on right
  doc.fontSize(32)
     .fillColor('#0F172A')
     .text(documentType, pageWidth - 200, 60, { width: 150, align: 'right' });
  
  // Document number
  doc.fontSize(14)
     .fillColor('#64748B')
     .text(`#${documentNumber}`, pageWidth - 200, 95, { width: 150, align: 'right' });
  
  // Header line
  doc.moveTo(margin, 130)
     .lineTo(pageWidth - margin, 130)
     .strokeColor('#4C6FFF')
     .lineWidth(2)
     .stroke();
  
  return 150; // Return Y position after header
}

// Helper function to add footer
function addFooter(doc, settings, pageNum = 1, totalPages = 1) {
  const pageHeight = 792; // A4 height in points
  const margin = 50;
  
  // Footer line
  doc.moveTo(margin, pageHeight - 80)
     .lineTo(612 - margin, pageHeight - 80)
     .strokeColor('#E2E8F0')
     .lineWidth(1)
     .stroke();
  
  // Footer text
  doc.fontSize(9)
     .fillColor('#64748B')
     .text(settings.footerLeft || 'FireLynx Interior Design Studio', margin, pageHeight - 65)
     .text(`Page ${pageNum} of ${totalPages}`, 612 - 150, pageHeight - 65, { width: 100, align: 'right' })
     .text(settings.footerRight || 'support@firelynx.com • +1 (555) 123-4567', 612 - 300, pageHeight - 50, { width: 250, align: 'right' });
}

// Generate branded invoice PDF
async function generateInvoicePDF(invoiceData, projectData, settings) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 80, left: 50, right: 50 }
      });
      
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add header
      const yPos = addBrandedHeader(doc, settings, 'INVOICE', invoiceData.number);
      let currentY = yPos + 20;
      
      // Invoice meta information
      const metaY = currentY;
      doc.fontSize(12)
         .fillColor('#0F172A')
         .text('Issue Date:', 50, metaY)
         .text(new Date(invoiceData.issueDate).toLocaleDateString(), 150, metaY)
         .text('Due Date:', 350, metaY)
         .text(new Date(invoiceData.dueDate).toLocaleDateString(), 430, metaY);
      
      // Status badge
      const statusColor = invoiceData.status === 'Paid' ? '#10B981' : 
                         invoiceData.status === 'Overdue' ? '#EF4444' : '#F59E0B';
      doc.fontSize(10)
         .fillColor(statusColor)
         .text(`Status: ${invoiceData.status || 'Draft'}`, 50, metaY + 25);
      
      currentY = metaY + 55;
      
      // Bill To section
      doc.fontSize(14)
         .fillColor('#0F172A')
         .text('Bill To:', 50, currentY);
      
      currentY += 20;
      doc.fontSize(11)
         .text(projectData?.clientName || 'Client Name', 50, currentY);
      
      if (projectData?.clientCompany) {
        currentY += 15;
        doc.text(projectData.clientCompany, 50, currentY);
      }
      
      if (projectData?.clientAddress) {
        currentY += 15;
        doc.text(projectData.clientAddress, 50, currentY);
      }
      
      if (projectData?.clientEmail) {
        currentY += 15;
        doc.text(projectData.clientEmail, 50, currentY);
      }
      
      currentY += 40;
      
      // Project information
      if (projectData?.title) {
        doc.fontSize(12)
           .fillColor('#64748B')
           .text(`Project: ${projectData.title}`, 50, currentY);
        currentY += 25;
      }
      
      // Line items table header
      doc.fontSize(12)
         .fillColor('#0F172A')
         .text('INVOICE ITEMS', 50, currentY);
      currentY += 20;
      
      // Table header background
      doc.rect(50, currentY, 512, 25)
         .fill('#F8FAFC');
      
      // Table headers
      doc.fontSize(10)
         .fillColor('#0F172A')
         .text('Description', 60, currentY + 8)
         .text('Qty', 350, currentY + 8)
         .text('Rate', 400, currentY + 8)
         .text('Amount', 500, currentY + 8);
      
      currentY += 35;
      
      // Line items
      const lineItems = invoiceData.lineItems || [];
      let subtotal = 0;
      let totalTax = 0;
      
      lineItems.forEach((item, index) => {
        if (currentY > 650) { // New page if needed
          addFooter(doc, settings);
          doc.addPage();
          currentY = 50;
        }
        
        const qty = parseFloat(item.quantity || 0);
        const rate = parseFloat(item.rate || 0);
        const taxPercent = parseFloat(item.taxPercent || 0);
        const lineTotal = qty * rate;
        const taxAmount = lineTotal * (taxPercent / 100);
        const finalAmount = lineTotal + taxAmount;
        
        subtotal += lineTotal;
        totalTax += taxAmount;
        
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 512, 20)
             .fill('#FAFAFA');
        }
        
        doc.fontSize(9)
           .fillColor('#0F172A')
           .text(item.description || 'Item', 60, currentY, { width: 280 })
           .text(qty.toString(), 350, currentY)
           .text(formatCurrency(rate, invoiceData.currency), 400, currentY)
           .text(formatCurrency(finalAmount, invoiceData.currency), 500, currentY);
        
        currentY += 20;
      });
      
      // Totals section
      currentY += 20;
      const totalsX = 400;
      
      doc.fontSize(11)
         .fillColor('#64748B')
         .text('Subtotal:', totalsX, currentY)
         .text(formatCurrency(subtotal, invoiceData.currency), totalsX + 80, currentY);
      
      currentY += 18;
      doc.text('Tax:', totalsX, currentY)
         .text(formatCurrency(totalTax, invoiceData.currency), totalsX + 80, currentY);
      
      currentY += 18;
      // Total line
      doc.moveTo(totalsX, currentY)
         .lineTo(562, currentY)
         .stroke();
      
      currentY += 10;
      doc.fontSize(14)
         .fillColor('#0F172A')
         .text('Total:', totalsX, currentY)
         .text(formatCurrency(subtotal + totalTax, invoiceData.currency), totalsX + 80, currentY);
      
      // Notes section
      if (invoiceData.notes) {
        currentY += 40;
        doc.fontSize(10)
           .fillColor('#64748B')
           .text('Notes:', 50, currentY)
           .fontSize(9)
           .text(invoiceData.notes, 50, currentY + 15, { width: 500 });
      }
      
      // Payment terms
      currentY += 60;
      doc.fontSize(9)
         .fillColor('#64748B')
         .text('Payment Terms: Net 30 days. Bank Transfer: Account #12345 | Credit Card: Visa/Mastercard accepted', 50, currentY, { width: 500 });
      
      // Add footer
      addFooter(doc, settings);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Generate branded variation request PDF
async function generateVariationPDF(variationData, projectData, settings) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 80, left: 50, right: 50 }
      });
      
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add header
      const yPos = addBrandedHeader(doc, settings, 'VARIATION REQUEST', variationData.number);
      let currentY = yPos + 20;
      
      // Variation meta information
      const metaY = currentY;
      doc.fontSize(12)
         .fillColor('#0F172A')
         .text('Date:', 50, metaY)
         .text(new Date(variationData.date).toLocaleDateString(), 150, metaY)
         .text('Requestor:', 350, metaY)
         .text(variationData.changeRequestor || 'N/A', 430, metaY);
      
      // Status badge
      const statusColor = variationData.status === 'Approved' ? '#10B981' : 
                         variationData.status === 'Rejected' ? '#EF4444' : '#F59E0B';
      doc.fontSize(10)
         .fillColor(statusColor)
         .text(`Status: ${variationData.status || 'Pending'}`, 50, metaY + 25);
      
      currentY = metaY + 55;
      
      // Project information
      if (projectData?.title) {
        doc.fontSize(14)
           .fillColor('#0F172A')
           .text('Project:', 50, currentY);
        
        currentY += 20;
        doc.fontSize(12)
           .text(projectData.title, 50, currentY);
        currentY += 25;
        
        if (projectData?.clientName) {
          doc.fontSize(11)
             .fillColor('#64748B')
             .text(`Client: ${projectData.clientName}`, 50, currentY);
          currentY += 20;
        }
      }
      
      // Change details section
      currentY += 10;
      doc.fontSize(14)
         .fillColor('#0F172A')
         .text('CHANGE REQUEST DETAILS', 50, currentY);
      
      currentY += 25;
      
      if (variationData.changeReference) {
        doc.fontSize(11)
           .fillColor('#64748B')
           .text('Reference:', 50, currentY)
           .fontSize(11)
           .fillColor('#0F172A')
           .text(variationData.changeReference, 120, currentY);
        currentY += 20;
      }
      
      if (variationData.changeArea) {
        doc.fontSize(11)
           .fillColor('#64748B')
           .text('Area:', 50, currentY)
           .fontSize(11)
           .fillColor('#0F172A')
           .text(variationData.changeArea, 120, currentY);
        currentY += 20;
      }
      
      // Work types
      if (variationData.workTypes && variationData.workTypes.length > 0) {
        doc.fontSize(11)
           .fillColor('#64748B')
           .text('Work Types:', 50, currentY);
        
        const workTypes = Array.isArray(variationData.workTypes) ? 
          variationData.workTypes : 
          JSON.parse(variationData.workTypes || '[]');
        
        doc.fontSize(10)
           .fillColor('#0F172A')
           .text(workTypes.join(', '), 120, currentY, { width: 400 });
        currentY += 25;
      }
      
      // Categories
      if (variationData.categories && variationData.categories.length > 0) {
        doc.fontSize(11)
           .fillColor('#64748B')
           .text('Categories:', 50, currentY);
        
        const categories = Array.isArray(variationData.categories) ? 
          variationData.categories : 
          JSON.parse(variationData.categories || '[]');
        
        doc.fontSize(10)
           .fillColor('#0F172A')
           .text(categories.join(', '), 120, currentY, { width: 400 });
        currentY += 25;
      }
      
      // Description sections
      if (variationData.changeDescription) {
        currentY += 10;
        doc.fontSize(12)
           .fillColor('#0F172A')
           .text('Change Description:', 50, currentY);
        currentY += 20;
        
        doc.fontSize(10)
           .fillColor('#64748B')
           .text(variationData.changeDescription, 50, currentY, { width: 500 });
        currentY += Math.max(30, doc.heightOfString(variationData.changeDescription, { width: 500 }) + 10);
      }
      
      if (variationData.reasonDescription) {
        currentY += 10;
        doc.fontSize(12)
           .fillColor('#0F172A')
           .text('Reason:', 50, currentY);
        currentY += 20;
        
        doc.fontSize(10)
           .fillColor('#64748B')
           .text(variationData.reasonDescription, 50, currentY, { width: 500 });
        currentY += Math.max(30, doc.heightOfString(variationData.reasonDescription, { width: 500 }) + 10);
      }
      
      if (variationData.technicalChanges) {
        currentY += 10;
        doc.fontSize(12)
           .fillColor('#0F172A')
           .text('Technical Changes:', 50, currentY);
        currentY += 20;
        
        doc.fontSize(10)
           .fillColor('#64748B')
           .text(variationData.technicalChanges, 50, currentY, { width: 500 });
        currentY += Math.max(30, doc.heightOfString(variationData.technicalChanges, { width: 500 }) + 10);
      }
      
      if (variationData.resourcesAndCosts) {
        currentY += 10;
        doc.fontSize(12)
           .fillColor('#0F172A')
           .text('Resources & Costs:', 50, currentY);
        currentY += 20;
        
        doc.fontSize(10)
           .fillColor('#64748B')
           .text(variationData.resourcesAndCosts, 50, currentY, { width: 500 });
        currentY += Math.max(30, doc.heightOfString(variationData.resourcesAndCosts, { width: 500 }) + 10);
      }
      
      // Disposition section
      if (variationData.disposition) {
        currentY += 20;
        doc.fontSize(12)
           .fillColor('#0F172A')
           .text('DISPOSITION', 50, currentY);
        currentY += 20;
        
        doc.fontSize(11)
           .fillColor(statusColor)
           .text(`Decision: ${variationData.disposition}`, 50, currentY);
        currentY += 20;
        
        if (variationData.dispositionReason) {
          doc.fontSize(10)
             .fillColor('#64748B')
             .text(variationData.dispositionReason, 50, currentY, { width: 500 });
          currentY += Math.max(20, doc.heightOfString(variationData.dispositionReason, { width: 500 }) + 10);
        }
      }
      
      // Signature section
      currentY += 40;
      doc.fontSize(10)
         .fillColor('#64748B')
         .text('Authorized Signature:', 50, currentY)
         .text('Date:', 350, currentY);
      
      // Signature lines
      doc.moveTo(50, currentY + 30)
         .lineTo(200, currentY + 30)
         .stroke();
      
      doc.moveTo(350, currentY + 30)
         .lineTo(450, currentY + 30)
         .stroke();
      
      // Add footer
      addFooter(doc, settings);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoicePDF,
  generateVariationPDF,
  formatCurrency
};