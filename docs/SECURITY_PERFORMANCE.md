# FireLynx Security & Performance Review

## Summary

This document provides a comprehensive security audit and performance analysis of the FireLynx codebase. It identifies vulnerabilities, performance bottlenecks, and provides actionable recommendations for improvement.

## How to Use This Doc

- **Security Issues**: Prioritized vulnerability list with mitigation strategies
- **Performance Analysis**: Bottleneck identification with optimization recommendations
- **Code Quality**: Standards compliance and improvement opportunities
- **Implementation Guide**: Step-by-step security and performance enhancements

---

## Security Assessment

### Critical Security Issues

#### 1. No Authentication System ⚠️ CRITICAL
**Citations**: All API routes lack authentication middleware

**Issue**: All API endpoints are publicly accessible without authentication
```javascript
// Current state - no auth middleware
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
// All routes exposed publicly
```

**Impact**: 
- Complete data exposure
- Unauthorized project access
- Financial data breach potential
- No audit trail for actions

**Recommendation**:
```javascript
// Implement JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Apply to all protected routes
app.use('/api/*', authenticateToken);
```

#### 2. SQL Injection Vulnerability Potential 🔸 HIGH
**Citations**: `server/routes/*.js` - Database queries using Drizzle ORM

**Current State**: Using Drizzle ORM provides some protection
```javascript
// Good - Parameterized queries via Drizzle
const project = await db
  .select()
  .from(projects)
  .where(eq(projects.id, id));
```

**Concern**: Direct SQL concatenation not found, but custom queries need review

**Recommendation**: 
- Audit all dynamic query construction
- Implement input sanitization middleware
- Use prepared statements for complex queries

#### 3. File Upload Security Gaps 🔸 HIGH
**Citations**: `server/index.js:101-135`

**Issues Identified**:
```javascript
// Current file type validation
const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
// Missing: MIME type spoofing protection
// Missing: File content validation
// Missing: Virus scanning
```

**Vulnerabilities**:
- **MIME Type Spoofing**: Relying only on extension/MIME headers
- **Executable Upload**: .txt files could contain scripts
- **Directory Traversal**: Filename validation insufficient
- **Storage Location**: Files stored in web-accessible directory

**Mitigation Strategy**:
```javascript
// Enhanced file validation
const fileUpload = multer({
  dest: 'uploads/',
  limits: { 
    fileSize: 50 * 1024 * 1024,
    files: 10 
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type against file signature
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'text/plain'
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    
    // Sanitize filename
    file.originalname = path.basename(file.originalname);
    cb(null, true);
  }
});

// Add file content validation
const validateFileContent = async (filePath, mimeType) => {
  const fileBuffer = await fs.readFile(filePath);
  const detectedType = await FileType.fromBuffer(fileBuffer);
  
  if (!detectedType || detectedType.mime !== mimeType) {
    throw new Error('File content does not match declared type');
  }
};
```

#### 4. CORS Configuration Security 🔸 MEDIUM
**Citations**: `server/index.js:74-89`

**Current Configuration**:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000', 
    /\.replit\.dev$/,
    /\.replit\.co$/,
    /\.replit\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

**Issues**:
- **Wildcard Subdomains**: `/.replit\.dev$/` allows any subdomain
- **Development Origins**: Production may inherit dev origins
- **Credentials**: Allowing credentials without strict origin control

**Recommendation**:
```javascript
// Environment-specific CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### 5. Environment Variable Exposure 🔸 MEDIUM
**Citations**: `server/database.js:22-27`

**Current State**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Database credentials in environment variables
});
```

**Issues**:
- No validation of required environment variables
- Database URL may contain credentials in logs
- Missing environment variable encryption

**Recommendation**:
```javascript
// Environment validation
const requiredEnvVars = [
  'DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Sanitized logging
const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    parsed.password = '[REDACTED]';
    return parsed.toString();
  } catch {
    return '[INVALID_URL]';
  }
};
```

### Medium Priority Security Issues

#### 6. Rate Limiting Configuration 🔸 MEDIUM
**Citations**: `server/index.js:95-99`

**Current Limits**:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```

**Issues**:
- **High Limit**: 1000 requests/15min may enable abuse
- **No Endpoint-Specific Limits**: File uploads same as health checks
- **No User-Based Limiting**: Only IP-based protection

**Recommendation**:
```javascript
// Tiered rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // Reduced general limit
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 uploads per minute
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500 // API-specific limit
});

// Apply selectively
app.use('/api/files/upload', uploadLimiter);
app.use('/api/', apiLimiter);
app.use(generalLimiter);
```

#### 7. Input Validation Gaps 🔸 MEDIUM
**Citations**: Route handlers throughout `server/routes/`

**Missing Validation**:
- **Email Format**: No server-side email validation
- **UUID Format**: Accepting any string as UUID
- **Decimal Precision**: No validation on financial amounts
- **Date Ranges**: No validation on date inputs

**Recommendation**:
```javascript
// Input validation middleware
const { body, param, validationResult } = require('express-validator');

const validateProject = [
  body('title').isLength({ min: 1, max: 255 }).trim(),
  body('clientId').isUUID(),
  body('budget').optional().isDecimal({ decimal_digits: '0,2' }),
  body('startDate').optional().isISO8601(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

// Apply to routes
router.post('/projects', validateProject, createProject);
```

#### 8. Error Information Leakage 🔸 LOW
**Citations**: `server/index.js:238-254`

**Current Error Handling**:
```javascript
res.status(err.status || 500).json({
  error: err.message || 'Internal server error',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

**Issues**:
- **Database Errors**: Raw database errors may expose schema
- **File Path Exposure**: Stack traces may reveal file paths
- **Development vs Production**: Different error responses

**Recommendation**:
```javascript
// Sanitized error responses
const handleError = (err, req, res, next) => {
  // Log full error for debugging
  console.error('Error:', err);
  
  // Send sanitized response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.status || 500;
  
  let message = 'Internal server error';
  if (statusCode < 500) {
    message = err.message; // Client errors safe to expose
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
};
```

---

## Performance Analysis

### Database Performance Issues

#### 1. Missing Database Indexes ⚠️ HIGH
**Citations**: `server/database.js` - No custom indexes defined

**Current State**: Only automatic indexes from Drizzle (PKs, FKs, unique constraints)

**Impact**:
- **Slow Project Queries**: No index on `status`, `clientId`
- **File Lookups**: No compound index on `projectId + visibility`
- **Date Range Queries**: No index on `createdAt`, `updatedAt`

**Query Performance Analysis**:
```sql
-- Slow query patterns identified:
SELECT * FROM projects WHERE status = 'In Progress'; -- Table scan
SELECT * FROM file_assets WHERE project_id = ? AND visibility = 'Client'; -- Partial index use
SELECT * FROM invoices WHERE created_at > '2024-01-01' ORDER BY created_at DESC; -- No index
```

**Recommendation**:
```sql
-- Essential indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client_created ON projects(client_id, created_at);
CREATE INDEX idx_file_assets_project_visibility ON file_assets(project_id, visibility);
CREATE INDEX idx_invoices_project_status ON invoices(project_id, status);
CREATE INDEX idx_tickets_project_status ON tickets(project_id, status);
CREATE INDEX idx_variations_project_status ON variation_requests(project_id, status);
CREATE INDEX idx_milestones_project_status ON milestones(project_id, status);

-- Composite indexes for common query patterns
CREATE INDEX idx_projects_status_priority_created ON projects(status, priority, created_at);
CREATE INDEX idx_invoices_status_due_date ON invoices(status, due_date);
```

#### 2. N+1 Query Problems 🔸 HIGH
**Citations**: Route handlers loading related data separately

**Problem Pattern**:
```javascript
// Current approach - potential N+1
const projects = await db.select().from(projects);
for (const project of projects) {
  const invoices = await db.select().from(invoices)
    .where(eq(invoices.projectId, project.id));
  // Generates N additional queries
}
```

**Solution**:
```javascript
// Optimized with JOINs and subqueries
const projectsWithData = await db
  .select({
    ...projects,
    invoiceCount: sql`COUNT(${invoices.id})`,
    totalInvoiced: sql`SUM(${invoices.total})`,
    lastInvoiceDate: sql`MAX(${invoices.createdAt})`
  })
  .from(projects)
  .leftJoin(invoices, eq(projects.id, invoices.projectId))
  .groupBy(projects.id);
```

#### 3. Connection Pool Optimization 🔸 MEDIUM
**Citations**: `server/database.js:22-27`

**Current Configuration**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // 30 second idle timeout
  connectionTimeoutMillis: 5000 // 5 second connection timeout
});
```

**Issues**:
- **Pool Size**: 20 connections may be excessive for small teams
- **Idle Timeout**: 30 seconds may be too aggressive
- **No Connection Monitoring**: No visibility into pool usage

**Optimization**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 2,                     // Minimum pool size
  max: 10,                    // Optimized for typical usage
  idleTimeoutMillis: 60000,   // 1 minute idle timeout
  connectionTimeoutMillis: 5000,
  acquireTimeoutMillis: 60000, // Wait up to 1 minute for connection
  // Connection health check
  reapIntervalMillis: 1000,
  returnToHead: false,
  // Pool monitoring
  log: (message) => console.log('DB Pool:', message)
});

// Pool monitoring
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});
```

### File Storage Performance

#### 4. File Storage Bottlenecks 🔸 MEDIUM
**Citations**: `server/index.js:101-135`, File upload handling

**Current Implementation**:
```javascript
// Local file storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
```

**Performance Issues**:
- **Local Storage**: Files compete with app for disk I/O
- **No CDN**: Files served directly by Node.js
- **No Caching**: Each file request hits filesystem
- **Thumbnail Generation**: Blocking image processing

**Optimization Strategy**:
```javascript
// 1. Asynchronous thumbnail generation
const Queue = require('bull');
const imageQueue = new Queue('image processing');

imageQueue.process(async (job) => {
  const { filePath, outputPath } = job.data;
  await sharp(filePath)
    .resize(300, 300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
});

// 2. File serving optimization
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // 1 day cache
  etag: true,
  lastModified: true
}));

// 3. Stream large files
app.get('/api/files/:id/download', async (req, res) => {
  const file = await getFileMetadata(req.params.id);
  const stream = fs.createReadStream(file.path);
  
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Length', file.size);
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  
  stream.pipe(res);
});
```

### Memory & CPU Optimization

#### 5. PDF Generation Performance 🔸 MEDIUM
**Citations**: `server/routes/pdf-html.js`

**Current Implementation**:
```javascript
// Synchronous PDF generation
const pdf = await htmlPdf.generatePdf(
  { content: renderedHtml },
  { format: 'A4', border: { top: '20mm' } }
);
```

**Issues**:
- **Blocking Operations**: PDF generation blocks event loop
- **Memory Usage**: Large PDFs consume significant memory
- **No Concurrency Control**: Multiple PDFs can overwhelm server

**Optimization**:
```javascript
// 1. Queue-based PDF generation
const pdfQueue = new Queue('PDF generation');

pdfQueue.process('invoice', async (job) => {
  const { invoiceId, options } = job.data;
  
  return await generatePdfAsync(invoiceId, options);
});

// 2. Stream-based generation
const generatePdfStream = async (template, data) => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(template);
    
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }
};

// 3. PDF caching
const pdfCache = new Map();
const generateCachedPdf = async (docId, version) => {
  const cacheKey = `${docId}-${version}`;
  
  if (pdfCache.has(cacheKey)) {
    return pdfCache.get(cacheKey);
  }
  
  const pdf = await generatePdf(docId);
  pdfCache.set(cacheKey, pdf);
  
  // Auto-expire cache entries
  setTimeout(() => pdfCache.delete(cacheKey), 60 * 60 * 1000);
  
  return pdf;
};
```

---

## Code Quality Assessment

### Architecture Issues

#### 1. Route Handler Complexity 🔸 MEDIUM
**Citations**: Large route handlers in `server/routes/*.js`

**Issues**:
- **Fat Controllers**: Route handlers contain business logic
- **Duplicate Code**: Similar patterns repeated across routes
- **No Service Layer**: Database logic mixed with HTTP handling

**Refactoring Recommendation**:
```javascript
// Service layer separation
class ProjectService {
  async getProjects(filters = {}) {
    const query = db.select().from(projects);
    
    if (filters.status) {
      query.where(eq(projects.status, filters.status));
    }
    
    if (filters.clientId) {
      query.where(eq(projects.clientId, filters.clientId));
    }
    
    return await query;
  }
  
  async createProject(projectData) {
    // Validation and business logic
    const validated = await validateProjectData(projectData);
    
    return await db.insert(projects).values(validated).returning();
  }
}

// Slim controller
const projectController = {
  async getProjects(req, res) {
    try {
      const projects = await ProjectService.getProjects(req.query);
      res.json({ success: true, data: projects });
    } catch (error) {
      handleError(error, res);
    }
  }
};
```

#### 2. Error Handling Inconsistency 🔸 MEDIUM
**Citations**: Inconsistent error handling across route files

**Current Problems**:
```javascript
// Inconsistent error responses
// Some routes:
res.status(500).json({ error: 'Failed to fetch projects' });

// Other routes:
res.status(500).json({ 
  success: false, 
  error: 'Database error',
  details: error.message 
});
```

**Standardization**:
```javascript
// Consistent error handling
class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  
  if (!err.isOperational) {
    statusCode = 500;
    message = 'Internal server error';
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### Testing & Monitoring Gaps

#### 3. No Test Coverage ⚠️ HIGH
**Citations**: No test files found in repository

**Missing Test Types**:
- **Unit Tests**: No function/service testing
- **Integration Tests**: No API endpoint testing
- **E2E Tests**: No user workflow testing
- **Performance Tests**: No load testing

**Test Strategy Recommendation**:
```javascript
// Unit tests example
describe('ProjectService', () => {
  it('should create project with valid data', async () => {
    const projectData = {
      title: 'Test Project',
      clientId: 'test-client-id'
    };
    
    const result = await ProjectService.createProject(projectData);
    
    expect(result.title).toBe('Test Project');
    expect(result.id).toBeDefined();
  });
});

// Integration tests
describe('Projects API', () => {
  it('GET /api/projects should return projects list', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

#### 4. No Application Monitoring 🔸 HIGH
**Citations**: Basic console logging only

**Missing Monitoring**:
- **Request Logging**: No structured request tracking
- **Performance Metrics**: No response time monitoring
- **Error Tracking**: No error aggregation
- **Health Checks**: Basic health endpoint only

**Monitoring Implementation**:
```javascript
// Structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Request tracking middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

// Performance monitoring
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
  logger.info(`Response time: ${time}ms for ${req.method} ${req.url}`);
}));
```

---

## Immediate Action Items

### Priority 1 (Critical - Implement Within 1 Week)

1. **Implement Authentication System**
   - JWT-based authentication
   - Role-based access control
   - Session management

2. **Enhance File Upload Security**
   - File content validation
   - MIME type verification
   - Storage location security

3. **Database Index Creation**
   - Essential performance indexes
   - Query optimization

### Priority 2 (High - Implement Within 1 Month)

1. **Input Validation Framework**
   - Request validation middleware
   - Data sanitization
   - Error handling standardization

2. **Application Monitoring**
   - Structured logging
   - Performance metrics
   - Error tracking

3. **Test Suite Development**
   - Unit test foundation
   - Integration test coverage
   - CI/CD pipeline

### Priority 3 (Medium - Implement Within 3 Months)

1. **Performance Optimization**
   - PDF generation optimization
   - File storage improvement
   - Database query optimization

2. **Security Hardening**
   - Rate limiting refinement
   - CORS policy tightening
   - Environment security

---

*Generated: Phase 4 of 6 - Security & Performance Review*  
*All issues identified from codebase analysis*  
*Recommendations prioritized by risk and impact*