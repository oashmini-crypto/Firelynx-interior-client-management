// FireLynx Backend Server
// Comprehensive API for project-centric workflows with branded PDF generation

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable trust proxy for Replit environment
app.set('trust proxy', 1);

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://*.replit.dev",
        "https://*.replit.com",
        "https://*.janeway.replit.dev",
        "blob:"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://*.replit.dev",
        "https://*.replit.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "blob:",
        "https:",
        "https://*.unsplash.com",
        "https://*.replit.dev",
        "https://*.replit.com"
      ],
      connectSrc: [
        "'self'",
        "https://*.replit.dev",
        "https://*.replit.com",
        "https://events.launchdarkly.com",
        "https://*.stripe.com",
        "https://replit.com",
        "wss://*.replit.dev",
        "wss://*.replit.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://*.replit.dev",
        "https://*.replit.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:", "data:"],
      frameSrc: [
        "'self'",
        "https://*.replit.dev",
        "https://*.replit.com"
      ]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : [
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://localhost:5000',
        /\.replit\.dev$/,
        /\.replit\.com$/,
        /\.janeway\.replit\.dev$/,
        'https://firelynx8840back.builtwithrocket.new'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve public files (for demo images and documents)
app.use('/files', express.static('public/files'));

// Database initialization
const { initializeDatabase } = require('./database');
const { seedDemoData } = require('./seeds');

// Diagnostics middleware
const { diagnostics, diagnosticsMiddleware } = require('./middleware/diagnostics');

// Enable diagnostics for all API routes
app.use('/api', diagnosticsMiddleware);

// Add diagnostic endpoints
const diagnosticsEndpoints = require('./diagnostics-endpoints');
app.use('/', diagnosticsEndpoints);

// Diagnostics route (hidden but accessible)
app.get('/__diagnostics', (req, res) => {
  res.json({
    title: 'FireLynx API Diagnostics',
    ...diagnostics.getData()
  });
});

// Clear diagnostics route
app.post('/__diagnostics/clear', (req, res) => {
  const result = diagnostics.clear();
  res.json(result);
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    return originalJson.call(this, data);
  };
  
  next();
});

// Route imports
const projectRoutes = require('./routes/projects');
const invoiceRoutes = require('./routes/invoices');
const teamRoutes = require('./routes/team');
const milestoneRoutes = require('./routes/milestones');
const milestoneFileRoutes = require('./routes/milestone-files');
const approvalRoutes = require('./routes/approvals');
const variationRoutes = require('./routes/variations');
const ticketRoutes = require('./routes/tickets');
const fileRoutes = require('./routes/files');
const brandingRoutes = require('./routes/branding');
const pdfRoutes = require('./routes/pdf-generation');
const pdfHtmlRoutes = require('./routes/pdf-html');

// Admin routes (before API routes for proper precedence)
const adminRoutes = require('./routes/admin');
app.use('/', adminRoutes);

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/milestone-files', upload.array('files', 10), milestoneFileRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/variations', require('./routes/variation-files'));
app.use('/api/tickets', ticketRoutes);
app.use('/api/files', upload.array('files', 10), fileRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/pdf', pdfHtmlRoutes); // New HTML-based PDF generation
app.use('/api/pdf-legacy', pdfRoutes); // Legacy PDFKit-based generation

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files per upload.' });
    }
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    const dbConnection = await initializeDatabase();
    
    if (dbConnection) {
      console.log('✅ Database initialized successfully');
      
      // Seed demo data in development if database is available
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log('🌱 Seeding comprehensive demo data...');
          const { seedComprehensiveData } = require('./comprehensive-seeds');
          await seedComprehensiveData();
          console.log('✅ Comprehensive demo data seeded successfully');
        } catch (seedError) {
          console.log('⚠️  Seed data failed, continuing with existing data');
          console.error(seedError);
        }
      }
    } else {
      console.log('⚠️  Database unavailable - server will use fallback data');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FireLynx Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: PostgreSQL`);
      console.log(`📁 File uploads: /uploads directory`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Server accessible on all interfaces (0.0.0.0:${PORT})`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;