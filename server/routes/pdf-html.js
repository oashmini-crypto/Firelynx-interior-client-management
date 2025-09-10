// HTML-based PDF generation routes using Puppeteer
// Replaces PDFKit with more flexible HTML template approach

const express = require('express');
const router = express.Router();
const htmlPdf = require('html-pdf-node');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { db, brandingSettings, invoices, projects, variationRequests } = require('../database');
const { eq, and } = require('drizzle-orm');

// Import reliable PDF generators
const { generateInvoicePDF, generateVariationPDF } = require('../utils/pdf-generators');

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

// Helper function to get currency symbol
function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED '
  };
  return symbols[currency] || '$';
}

// Helper function to format AED currency
function formatAED(amount) {
  return `AED ${parseFloat(amount || 0).toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Helper function to get status CSS class
function getStatusClass(status) {
  return status ? status.toLowerCase() : 'draft';
}

// Helper function to generate HTML from template
async function generateInvoiceHTML(invoiceData, projectData, settings) {
  const templatePath = path.join(__dirname, '../templates/invoice-template.html');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);
  
  // Process line items with calculations
  const processedLineItems = (invoiceData.lineItems || []).map(item => {
    const quantity = item.quantity || 0;
    const rate = item.rate || 0;
    const taxPercent = item.taxPercent || 0;
    const lineTotal = quantity * rate;
    const taxAmount = lineTotal * (taxPercent / 100);
    
    return {
      ...item,
      rate: rate.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      lineTotal: (lineTotal + taxAmount).toFixed(2)
    };
  });
  
  const currencySymbol = getCurrencySymbol(invoiceData.currency);
  
  const templateData = {
    // Company/Branding
    companyName: settings.appName || 'FireLynx',
    companyLogo: settings.logoUrl || null,
    companyAddress: '123 Design Street, Creative City, CA 90210',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'hello@firelynx.com',
    
    // Invoice Details
    invoiceNumber: invoiceData.number,
    issueDate: new Date(invoiceData.issueDate).toLocaleDateString(),
    dueDate: new Date(invoiceData.dueDate).toLocaleDateString(),
    status: invoiceData.status || 'Draft',
    statusClass: getStatusClass(invoiceData.status),
    currency: invoiceData.currency || 'USD',
    currencySymbol,
    
    // Client Details
    clientName: projectData?.clientName || 'Client Name',
    clientCompany: projectData?.clientCompany || '',
    clientPhone: projectData?.clientPhone || '',
    clientEmail: projectData?.clientEmail || '',
    clientAddress: projectData?.clientAddress || '',
    
    // Project Details
    projectTitle: projectData?.title || '',
    
    // Line Items
    lineItems: processedLineItems,
    
    // Totals
    subtotal: parseFloat(invoiceData.subtotal || 0).toFixed(2),
    taxTotal: parseFloat(invoiceData.taxTotal || 0).toFixed(2),
    total: parseFloat(invoiceData.total || 0).toFixed(2),
    
    // Additional Info
    notes: invoiceData.notes || '',
    paymentInfo: 'Bank Transfer: Account #12345 | Credit Card: Visa/Mastercard accepted',
    footerText: `${settings.footerLeft || 'FireLynx Design Studio'} • ${settings.footerRight || 'hello@firelynx.com'}`
  };
  
  return template(templateData);
}

// Helper function to generate HTML from variation template
async function generateVariationHTML(variationData, projectData, settings) {
  const templatePath = path.join(__dirname, '../templates/variation-template.html');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);
  
  // Process detailed costs if available
  let hasDetailedCosts = false;
  let totalCost = 0;
  
  const processedMaterialCosts = [];
  const processedLaborCosts = [];
  const processedAdditionalCosts = [];
  
  if (variationData.materialCosts && Array.isArray(variationData.materialCosts)) {
    hasDetailedCosts = true;
    variationData.materialCosts.forEach(item => {
      const total = (item.quantity || 0) * (item.unitRate || 0);
      processedMaterialCosts.push({
        ...item,
        unitRate: formatAED(item.unitRate || 0),
        total: formatAED(total)
      });
      totalCost += total;
    });
  }
  
  if (variationData.laborCosts && Array.isArray(variationData.laborCosts)) {
    hasDetailedCosts = true;
    variationData.laborCosts.forEach(item => {
      const total = (item.hours || 0) * (item.hourlyRate || 0);
      processedLaborCosts.push({
        ...item,
        hourlyRate: formatAED(item.hourlyRate || 0),
        total: formatAED(total)
      });
      totalCost += total;
    });
  }
  
  if (variationData.additionalCosts && Array.isArray(variationData.additionalCosts)) {
    hasDetailedCosts = true;
    variationData.additionalCosts.forEach(item => {
      const amount = parseFloat(item.amount || 0);
      processedAdditionalCosts.push({
        ...item,
        amount: formatAED(amount)
      });
      totalCost += amount;
    });
  }
  
  // Parse work types and categories from JSON if needed
  const workTypes = Array.isArray(variationData.workTypes) ? 
    variationData.workTypes : 
    (typeof variationData.workTypes === 'string' ? JSON.parse(variationData.workTypes || '[]') : []);
    
  const categories = Array.isArray(variationData.categories) ? 
    variationData.categories : 
    (typeof variationData.categories === 'string' ? JSON.parse(variationData.categories || '[]') : []);
  
  const templateData = {
    // Company/Branding
    companyName: settings.appName || 'FireLynx',
    companyLogo: settings.logoUrl || null,
    companyAddress: '123 Design Street, Creative City, CA 90210',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'hello@firelynx.com',
    
    // Variation Details
    variationNumber: variationData.number,
    requestDate: new Date(variationData.date).toLocaleDateString(),
    status: variationData.status || 'Pending',
    statusClass: getStatusClass(variationData.status || 'pending'),
    changeRequestor: variationData.changeRequestor || 'Client',
    changeReference: variationData.changeReference || null,
    changeArea: variationData.changeArea || '',
    
    // Client Details
    clientName: projectData?.clientName || 'Client Name',
    clientCompany: projectData?.clientCompany || '',
    clientPhone: projectData?.clientPhone || '',
    clientEmail: projectData?.clientEmail || '',
    clientAddress: projectData?.clientAddress || '',
    
    // Project Details
    projectTitle: projectData?.title || '',
    
    // Change Details
    changeDescription: variationData.changeDescription || '',
    reasonDescription: variationData.reasonDescription || '',
    technicalChanges: variationData.technicalChanges || null,
    resourcesAndCosts: variationData.resourcesAndCosts || null,
    
    // Work Types and Categories
    workTypes: workTypes,
    categories: categories,
    
    // Detailed Cost Structure
    hasDetailedCosts,
    materialCosts: processedMaterialCosts,
    laborCosts: processedLaborCosts,
    additionalCosts: processedAdditionalCosts,
    totalCost: formatAED(totalCost).replace('AED ', ''),
    
    // Footer
    footerText: `${settings.footerLeft || 'FireLynx Design Studio'} • ${settings.footerRight || 'hello@firelynx.com'}`
  };
  
  return template(templateData);
}

// GET /api/pdf/invoice/:invoiceId/preview - Show HTML preview of invoice (print-friendly)
router.get('/invoice/:invoiceId/preview', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    console.log(`🔄 Generating HTML preview for invoice ${invoiceId}`);
    
    // Get invoice data
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    
    if (invoice.length === 0) {
      console.log(`❌ Invoice ${invoiceId} not found`);
      return res.status(404).send('<h1>Invoice not found</h1>');
    }
    
    const invoiceData = invoice[0];
    console.log(`✅ Found invoice: ${invoiceData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (invoiceData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, invoiceData.projectId))
        .limit(1);
      projectData = project[0] || null;
      console.log(`✅ Found project: ${projectData?.title || 'Unknown'}`);
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    console.log('🔄 Generating HTML from template...');
    const html = await generateInvoiceHTML(invoiceData, projectData, settings);
    
    console.log(`✅ HTML preview generated for ${invoiceData.number}`);
    
    // Send HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('❌ Error generating invoice preview:', error);
    res.status(500).send('<h1>Error generating invoice preview</h1><p>' + error.message + '</p>');
  }
});

// GET /api/pdf/invoice/:invoiceId - Generate branded invoice PDF using HTML template
router.get('/invoice/:invoiceId', async (req, res) => {
  let browser;
  
  try {
    const { invoiceId } = req.params;
    
    console.log(`🔄 Generating PDF for invoice ${invoiceId}`);
    
    // Get invoice data
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    
    if (invoice.length === 0) {
      console.log(`❌ Invoice ${invoiceId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    const invoiceData = invoice[0];
    console.log(`✅ Found invoice: ${invoiceData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (invoiceData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, invoiceData.projectId))
        .limit(1);
      projectData = project[0] || null;
      console.log(`✅ Found project: ${projectData?.title || 'Unknown'}`);
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    console.log('🔄 Generating HTML from template...');
    const html = await generateInvoiceHTML(invoiceData, projectData, settings);
    
    // Configure PDF options
    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    };
    
    const file = { content: html };
    
    // Generate PDF using html-pdf-node
    console.log('🔄 Generating PDF...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    console.log(`✅ PDF generated successfully for ${invoiceData.number}`);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.number}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    
    // No browser cleanup needed for html-pdf-node
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate invoice PDF: ' + error.message
      });
    }
  }
});

// GET /api/pdf/variation/:variationId/preview - Show HTML preview of variation (print-friendly)
router.get('/variation/:variationId/preview', async (req, res) => {
  try {
    const { variationId } = req.params;
    
    console.log(`🔄 Generating HTML preview for variation ${variationId}`);
    
    // Get variation data
    const variation = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, variationId))
      .limit(1);
    
    if (variation.length === 0) {
      console.log(`❌ Variation ${variationId} not found`);
      return res.status(404).send('<h1>Variation request not found</h1>');
    }
    
    const variationData = variation[0];
    console.log(`✅ Found variation: ${variationData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (variationData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, variationData.projectId))
        .limit(1);
      projectData = project[0] || null;
      console.log(`✅ Found project: ${projectData?.title || 'Unknown'}`);
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    console.log('🔄 Generating HTML from variation template...');
    const html = await generateVariationHTML(variationData, projectData, settings);
    
    console.log(`✅ HTML preview generated for ${variationData.number}`);
    
    // Send HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('❌ Error generating variation preview:', error);
    res.status(500).send('<h1>Error generating variation preview</h1><p>' + error.message + '</p>');
  }
});

// GET /api/pdf/variation/:variationId - Generate branded variation PDF using HTML template
router.get('/variation/:variationId', async (req, res) => {
  try {
    const { variationId } = req.params;
    
    console.log(`🔄 Generating PDF for variation ${variationId}`);
    
    // Get variation data
    const variation = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, variationId))
      .limit(1);
    
    if (variation.length === 0) {
      console.log(`❌ Variation ${variationId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    const variationData = variation[0];
    console.log(`✅ Found variation: ${variationData.number}`);
    
    // Get project data for client details  
    let projectData = null;
    if (variationData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, variationData.projectId))
        .limit(1);
      projectData = project[0] || null;
      console.log(`✅ Found project: ${projectData?.title || 'Unknown'}`);
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    console.log('🔄 Generating HTML from variation template...');
    const html = await generateVariationHTML(variationData, projectData, settings);
    
    console.log('✅ HTML generated, creating PDF...');
    
    // Configure PDF options
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    };
    
    const file = { content: html };
    
    // Generate PDF using html-pdf-node
    console.log('🔄 Generating PDF...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    console.log(`✅ PDF generated successfully for ${variationData.number}`);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${variationData.number}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating variation PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate variation PDF: ' + error.message
      });
    }
  }
});

// Client-accessible endpoints (public URLs for client downloads)

// GET /api/pdf/projects/:projectId/invoices/:invoiceId - Project-scoped invoice PDF download
router.get('/projects/:projectId/invoices/:invoiceId', async (req, res) => {
  try {
    const { projectId, invoiceId } = req.params;
    
    console.log(`🔄 Client requesting invoice PDF: ${invoiceId} for project: ${projectId}`);
    
    // Get invoice data with project validation
    const invoice = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.projectId, projectId)
      ))
      .limit(1);
    
    if (invoice.length === 0) {
      console.log(`❌ Project-scoped invoice ${invoiceId} not found for project ${projectId}`);
      return res.status(404).json({
        success: false,
        error: 'Invoice not found or does not belong to this project'
      });
    }
    
    const invoiceData = invoice[0];
    console.log(`✅ Client accessing project-scoped invoice: ${invoiceData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (invoiceData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, invoiceData.projectId))
        .limit(1);
      projectData = project[0] || null;
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    const html = await generateInvoiceHTML(invoiceData, projectData, settings);
    
    // Configure PDF options
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    };
    
    const file = { content: html };
    
    // Generate PDF using reliable PDFKit generator
    const pdfBuffer = await generateInvoicePDF(invoiceData, projectData, settings);
    console.log(`✅ Project-scoped PDF generated for ${invoiceData.number}`);
    
    // Set response headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.number}_Invoice.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating project-scoped invoice PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate invoice PDF'
      });
    }
  }
});

// GET /api/pdf/client/invoice/:invoiceId - Client-accessible invoice PDF download (LEGACY)
router.get('/client/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    console.log(`🔄 Client requesting invoice PDF: ${invoiceId}`);
    
    // Get invoice data
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    
    if (invoice.length === 0) {
      console.log(`❌ Client invoice ${invoiceId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    const invoiceData = invoice[0];
    console.log(`✅ Client accessing invoice: ${invoiceData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (invoiceData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, invoiceData.projectId))
        .limit(1);
      projectData = project[0] || null;
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    const html = await generateInvoiceHTML(invoiceData, projectData, settings);
    
    // Configure PDF options
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    };
    
    const file = { content: html };
    
    // Generate PDF using reliable PDFKit generator
    const pdfBuffer = await generateInvoicePDF(invoiceData, projectData, settings);
    console.log(`✅ Client PDF generated for ${invoiceData.number}`);
    
    // Set response headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.number}_Invoice.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating client invoice PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate invoice PDF'
      });
    }
  }
});

// GET /api/pdf/projects/:projectId/variations/:variationId - Project-scoped variation PDF download  
router.get('/projects/:projectId/variations/:variationId', async (req, res) => {
  try {
    const { projectId, variationId } = req.params;
    
    console.log(`🔄 Client requesting variation PDF: ${variationId} for project: ${projectId}`);
    
    // Get variation data with project validation
    const variation = await db
      .select()
      .from(variationRequests)
      .where(and(
        eq(variationRequests.id, variationId),
        eq(variationRequests.projectId, projectId)
      ))
      .limit(1);
    
    if (variation.length === 0) {
      console.log(`❌ Project-scoped variation ${variationId} not found for project ${projectId}`);
      return res.status(404).json({
        success: false,
        error: 'Variation not found or does not belong to this project'
      });
    }
    
    const variationData = variation[0];
    console.log(`✅ Client accessing project-scoped variation: ${variationData.number}`);
    
    // Get project data for client details
    let projectData = null;
    if (variationData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, variationData.projectId))
        .limit(1);
      projectData = project[0] || null;
    }
    
    const settings = await getBrandingSettings();
    
    // Generate PDF using reliable PDFKit generator
    const pdfBuffer = await generateVariationPDF(variationData, projectData, settings);
    console.log(`✅ Project-scoped variation PDF generated for ${variationData.number}`);
    
    // Set response headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${variationData.number}_Variation.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating project-scoped variation PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate variation PDF'
      });
    }
  }
});

// GET /api/pdf/client/variation/:variationId - Client-accessible variation PDF download (LEGACY)
router.get('/client/variation/:variationId', async (req, res) => {
  try {
    const { variationId } = req.params;
    
    console.log(`🔄 Client requesting variation PDF: ${variationId}`);
    
    // Get variation data
    const variation = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.id, variationId))
      .limit(1);
    
    if (variation.length === 0) {
      console.log(`❌ Client variation ${variationId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Variation request not found'
      });
    }
    
    const variationData = variation[0];
    console.log(`✅ Client accessing variation: ${variationData.number}`);
    
    // Get project data for client details  
    let projectData = null;
    if (variationData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, variationData.projectId))
        .limit(1);
      projectData = project[0] || null;
    }
    
    const settings = await getBrandingSettings();
    
    // Generate HTML from template
    const html = await generateVariationHTML(variationData, projectData, settings);
    
    // Configure PDF options
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    };
    
    const file = { content: html };
    
    // Generate PDF
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    console.log(`✅ Client PDF generated for ${variationData.number}`);
    
    // Set response headers for direct download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${variationData.number}_Variation.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generating client variation PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate variation PDF'
      });
    }
  }
});

// GET /api/pdf/client/project/:projectId/documents - Get all client-accessible documents for a project
router.get('/client/project/:projectId/documents', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    console.log(`🔄 Client requesting document list for project: ${projectId}`);
    
    // Get project info
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    
    if (project.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Get all invoices for this project
    const projectInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.projectId, projectId));
    
    // Get all variations for this project
    const projectVariations = await db
      .select()
      .from(variationRequests)
      .where(eq(variationRequests.projectId, projectId));
    
    const documents = {
      project: project[0],
      invoices: projectInvoices.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        total: invoice.total,
        dueDate: invoice.dueDate,
        downloadUrl: `/api/pdf/client/invoice/${invoice.id}`
      })),
      variations: projectVariations.map(variation => ({
        id: variation.id,
        number: variation.number,
        status: variation.status,
        title: variation.title || variation.changeDescription?.substring(0, 50) + '...',
        date: variation.date,
        downloadUrl: `/api/pdf/client/variation/${variation.id}`
      }))
    };
    
    console.log(`✅ Found ${documents.invoices.length} invoices and ${documents.variations.length} variations for project`);
    
    res.json({
      success: true,
      data: documents
    });
    
  } catch (error) {
    console.error('❌ Error fetching client project documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project documents'
    });
  }
});

module.exports = router;