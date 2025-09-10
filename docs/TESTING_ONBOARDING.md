# FireLynx Testing Strategy & Developer Onboarding

## Summary

This document provides a comprehensive testing strategy and developer onboarding guide for the FireLynx codebase. It includes test framework recommendations, onboarding workflows, and development environment setup.

## How to Use This Doc

- **Testing Framework**: Complete test suite architecture and implementation
- **Developer Onboarding**: Step-by-step setup and learning path
- **CI/CD Strategy**: Automated testing and deployment recommendations
- **Documentation Standards**: Code and API documentation guidelines

---

## Current Testing State

### Test Coverage Analysis ⚠️ CRITICAL GAP

**Current State**: Zero test coverage identified
- No test files found in repository
- No testing framework configured
- No CI/CD pipeline for automated testing
- No test database setup

**Risk Assessment**:
- **Deployment Risk**: No validation before production releases
- **Regression Risk**: Changes may break existing functionality
- **Maintenance Risk**: Refactoring without safety net
- **Quality Risk**: No verification of business logic

---

## Recommended Testing Strategy

### 1. Testing Framework Architecture

**Technology Stack Recommendation**:
```json
{
  "dependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "testcontainers": "^9.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "devDependencies": {
    "jest-environment-node": "^29.0.0",
    "jest-extended": "^4.0.0"
  }
}
```

**Jest Configuration**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/server'],
  testMatch: [
    '**/__tests__/**/*.test.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    'src/**/*.{js,ts,jsx,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### 2. Test Database Strategy

**Docker Test Database**:
```javascript
// tests/setup.js
const { GenericContainer } = require('testcontainers');
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

let testContainer;
let testDb;

beforeAll(async () => {
  // Start PostgreSQL test container
  testContainer = await new GenericContainer('postgres:15')
    .withEnvironment({
      POSTGRES_DB: 'firelynx_test',
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test'
    })
    .withExposedPorts(5432)
    .start();

  const port = testContainer.getMappedPort(5432);
  const connectionString = `postgresql://test:test@localhost:${port}/firelynx_test`;
  
  // Initialize test database
  const pool = new Pool({ connectionString });
  testDb = drizzle(pool);
  
  // Run schema setup
  await setupTestSchema(testDb);
}, 30000);

afterAll(async () => {
  if (testContainer) {
    await testContainer.stop();
  }
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase(testDb);
  await seedTestData(testDb);
});
```

### 3. Unit Testing Implementation

**Service Layer Tests**:
```javascript
// server/__tests__/services/projectService.test.js
const { ProjectService } = require('../../services/ProjectService');
const { createTestProject, createTestClient } = require('../helpers/testData');

describe('ProjectService', () => {
  let projectService;
  
  beforeEach(() => {
    projectService = new ProjectService(testDb);
  });

  describe('createProject', () => {
    it('should create project with valid data', async () => {
      const client = await createTestClient(testDb);
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        clientId: client.id,
        budget: '50000.00'
      };

      const result = await projectService.createProject(projectData);

      expect(result).toMatchObject({
        title: 'Test Project',
        description: 'Test Description',
        clientId: client.id,
        budget: '50000.00',
        status: 'Planning',
        progress: 0
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid client ID', async () => {
      const projectData = {
        title: 'Test Project',
        clientId: 'invalid-uuid'
      };

      await expect(projectService.createProject(projectData))
        .rejects
        .toThrow('Invalid client ID');
    });

    it('should validate budget format', async () => {
      const client = await createTestClient(testDb);
      const projectData = {
        title: 'Test Project',
        clientId: client.id,
        budget: 'invalid-budget'
      };

      await expect(projectService.createProject(projectData))
        .rejects
        .toThrow('Invalid budget format');
    });
  });

  describe('getProjectsByStatus', () => {
    it('should filter projects by status', async () => {
      const client = await createTestClient(testDb);
      
      // Create projects with different statuses
      await createTestProject(testDb, { 
        clientId: client.id, 
        status: 'In Progress' 
      });
      await createTestProject(testDb, { 
        clientId: client.id, 
        status: 'Completed' 
      });
      await createTestProject(testDb, { 
        clientId: client.id, 
        status: 'In Progress' 
      });

      const inProgressProjects = await projectService.getProjectsByStatus('In Progress');
      const completedProjects = await projectService.getProjectsByStatus('Completed');

      expect(inProgressProjects).toHaveLength(2);
      expect(completedProjects).toHaveLength(1);
      expect(inProgressProjects[0].status).toBe('In Progress');
    });
  });
});
```

**Auto-Numbering Tests**:
```javascript
// server/__tests__/utils/autoNumbering.test.js
const { generateInvoiceNumber, generateVariationNumber } = require('../../utils/autoNumbering');

describe('Auto-numbering System', () => {
  beforeEach(async () => {
    // Clean counters table
    await testDb.delete(documentCounters);
  });

  describe('generateInvoiceNumber', () => {
    it('should generate first invoice number for new year', async () => {
      const number = await generateInvoiceNumber(testDb);
      expect(number).toBe('INV-2025-0001');
    });

    it('should increment counter for subsequent invoices', async () => {
      await generateInvoiceNumber(testDb); // INV-2025-0001
      await generateInvoiceNumber(testDb); // INV-2025-0002
      const third = await generateInvoiceNumber(testDb);
      
      expect(third).toBe('INV-2025-0003');
    });

    it('should handle concurrent number generation', async () => {
      const promises = Array.from({ length: 10 }, () => 
        generateInvoiceNumber(testDb)
      );
      
      const numbers = await Promise.all(promises);
      const uniqueNumbers = new Set(numbers);
      
      expect(uniqueNumbers.size).toBe(10); // All numbers should be unique
      expect(numbers).toContain('INV-2025-0001');
      expect(numbers).toContain('INV-2025-0010');
    });
  });

  describe('yearly reset behavior', () => {
    it('should reset counters for new year', async () => {
      // Mock current year as 2024
      jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      const number2024 = await generateInvoiceNumber(testDb);
      expect(number2024).toBe('INV-2024-0001');
      
      // Mock current year as 2025
      Date.prototype.getFullYear.mockReturnValue(2025);
      const number2025 = await generateInvoiceNumber(testDb);
      expect(number2025).toBe('INV-2025-0001');
      
      Date.prototype.getFullYear.mockRestore();
    });
  });
});
```

### 4. Integration Testing

**API Endpoint Tests**:
```javascript
// server/__tests__/routes/projects.test.js
const request = require('supertest');
const app = require('../../index');

describe('Projects API', () => {
  describe('GET /api/projects', () => {
    it('should return projects list with client information', async () => {
      const client = await createTestClient(testDb);
      await createTestProject(testDb, { clientId: client.id });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number)
      });

      const project = response.body.data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('clientName');
      expect(project).toHaveProperty('clientEmail');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database failure
      jest.spyOn(testDb, 'select').mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/projects')
        .expect(200); // Should fallback to mock data

      expect(response.body.source).toBe('mock');
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('POST /api/projects', () => {
    it('should create new project with valid data', async () => {
      const client = await createTestClient(testDb);
      const projectData = {
        title: 'New Test Project',
        description: 'Test project description',
        clientId: client.id,
        budget: '75000.00',
        priority: 'High'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          title: 'New Test Project',
          clientId: client.id,
          budget: '75000.00',
          priority: 'High',
          status: 'Planning',
          progress: 0
        }
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ description: 'Missing title and clientId' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('required')
      });
    });

    it('should validate client existence', async () => {
      const projectData = {
        title: 'Test Project',
        clientId: 'non-existent-id'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(400);

      expect(response.body.error).toContain('Client not found');
    });
  });
});
```

**File Upload Tests**:
```javascript
// server/__tests__/routes/files.test.js
const path = require('path');
const fs = require('fs');

describe('File Upload API', () => {
  let testProject;

  beforeEach(async () => {
    const client = await createTestClient(testDb);
    testProject = await createTestProject(testDb, { clientId: client.id });
  });

  describe('POST /api/files/upload', () => {
    it('should upload valid image file', async () => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      
      const response = await request(app)
        .post('/api/files/upload')
        .field('projectId', testProject.id)
        .field('visibility', 'Client')
        .attach('files', testImagePath)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        uploadedFiles: expect.arrayContaining([
          expect.objectContaining({
            originalName: 'test-image.jpg',
            contentType: 'image/jpeg',
            visibility: 'Client',
            projectId: testProject.id
          })
        ])
      });

      // Verify file exists on filesystem
      const uploadedFile = response.body.uploadedFiles[0];
      expect(fs.existsSync(uploadedFile.url.replace('/', ''))).toBe(true);
    });

    it('should reject invalid file types', async () => {
      const testFilePath = path.join(__dirname, '../fixtures/malicious.exe');
      
      const response = await request(app)
        .post('/api/files/upload')
        .field('projectId', testProject.id)
        .attach('files', testFilePath)
        .expect(400);

      expect(response.body.error).toContain('Invalid file type');
    });

    it('should enforce file size limits', async () => {
      // Create a large test file (>50MB)
      const largeFilePath = path.join(__dirname, '../fixtures/large-file.bin');
      
      const response = await request(app)
        .post('/api/files/upload')
        .field('projectId', testProject.id)
        .attach('files', largeFilePath)
        .expect(400);

      expect(response.body.error).toContain('File too large');
    });
  });

  describe('PUT /api/files/:id/visibility', () => {
    it('should update file visibility', async () => {
      const file = await createTestFile(testDb, { 
        projectId: testProject.id,
        visibility: 'Client'
      });

      const response = await request(app)
        .put(`/api/files/${file.id}/visibility`)
        .send({ visibility: 'Internal' })
        .expect(200);

      expect(response.body.data.visibility).toBe('Internal');
    });
  });
});
```

### 5. End-to-End Testing

**User Workflow Tests**:
```javascript
// tests/e2e/projectWorkflow.test.js
describe('Complete Project Workflow', () => {
  it('should complete full project lifecycle', async () => {
    // 1. Create client
    const client = await createTestClient(testDb);
    
    // 2. Create project
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({
        title: 'E2E Test Project',
        clientId: client.id,
        budget: '100000.00'
      })
      .expect(201);
    
    const project = projectResponse.body.data;
    
    // 3. Add team members
    const user = await createTestUser(testDb);
    await request(app)
      .post('/api/team')
      .send({
        projectId: project.id,
        userId: user.id,
        role: 'Project Manager'
      })
      .expect(201);
    
    // 4. Create milestone
    const milestoneResponse = await request(app)
      .post('/api/milestones')
      .send({
        projectId: project.id,
        title: 'Design Phase',
        description: 'Initial design concepts'
      })
      .expect(201);
    
    const milestone = milestoneResponse.body.data;
    
    // 5. Upload files to milestone
    const testImagePath = path.join(__dirname, '../fixtures/design-concept.jpg');
    const fileResponse = await request(app)
      .post(`/api/milestones/${milestone.id}/upload`)
      .field('uploadedByUserId', user.id)
      .attach('files', testImagePath)
      .expect(201);
    
    // 6. Create approval packet
    const approvalResponse = await request(app)
      .post('/api/approvals')
      .send({
        projectId: project.id,
        title: 'Design Concept Approval',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fileAssetIds: [fileResponse.body.uploadedFiles[0].id]
      })
      .expect(201);
    
    // 7. Send approval to client
    await request(app)
      .post(`/api/approvals/${approvalResponse.body.data.id}/send`)
      .expect(200);
    
    // 8. Client approves
    await request(app)
      .post(`/api/approvals/${approvalResponse.body.data.id}/decision`)
      .send({
        decision: 'Approved',
        signatureName: 'Test Client'
      })
      .expect(200);
    
    // 9. Create variation request
    const variationResponse = await request(app)
      .post('/api/variations')
      .send({
        projectId: project.id,
        changeRequestor: 'Test Client',
        changeArea: 'Living Room',
        workTypes: ['Design'],
        categories: ['Scope'],
        changeDescription: 'Add built-in shelving',
        reasonDescription: 'Client request for additional storage'
      })
      .expect(201);
    
    // 10. Submit variation for approval
    await request(app)
      .post(`/api/variations/${variationResponse.body.data.id}/submit`)
      .expect(200);
    
    // 11. Create and send invoice
    const invoiceResponse = await request(app)
      .post('/api/invoices')
      .send({
        projectId: project.id,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: [
          {
            description: 'Design Services',
            quantity: 40,
            rate: 150.00,
            taxPercent: 10.0
          }
        ]
      })
      .expect(201);
    
    await request(app)
      .post(`/api/invoices/${invoiceResponse.body.data.id}/send`)
      .expect(200);
    
    // 12. Verify final project state
    const finalProjectResponse = await request(app)
      .get(`/api/projects/${project.id}`)
      .expect(200);
    
    expect(finalProjectResponse.body.data).toMatchObject({
      id: project.id,
      title: 'E2E Test Project',
      status: 'Planning'
    });
    
    // Verify related data was created
    const milestonesResponse = await request(app)
      .get(`/api/milestones?projectId=${project.id}`)
      .expect(200);
    expect(milestonesResponse.body.data).toHaveLength(1);
    
    const approvalsResponse = await request(app)
      .get(`/api/approvals/project/${project.id}`)
      .expect(200);
    expect(approvalsResponse.body.data).toHaveLength(1);
    
    const variationsResponse = await request(app)
      .get(`/api/variations/project/${project.id}`)
      .expect(200);
    expect(variationsResponse.body.data).toHaveLength(1);
    
    const invoicesResponse = await request(app)
      .get(`/api/invoices/project/${project.id}`)
      .expect(200);
    expect(invoicesResponse.body.data).toHaveLength(1);
  });
});
```

---

## Developer Onboarding Guide

### 1. Environment Setup

**Prerequisites Checklist**:
```bash
# Required Software
□ Node.js 18+ installed
□ Git configured with SSH keys
□ Docker Desktop running
□ PostgreSQL client (psql) installed
□ VS Code with recommended extensions

# VS Code Extensions
□ ES7+ React/Redux/React-Native snippets
□ Prettier - Code formatter
□ ESLint
□ Thunder Client (API testing)
□ GitLens
□ Auto Rename Tag
□ Bracket Pair Colorizer
□ Path Intellisense
```

**Initial Setup Script**:
```bash
#!/bin/bash
# setup.sh - Developer environment setup

echo "🚀 Setting up FireLynx development environment..."

# 1. Clone repository
if [ ! -d "FireLynx" ]; then
  git clone [repository-url] FireLynx
  cd FireLynx
else
  cd FireLynx
  git pull origin main
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Environment configuration
if [ ! -f ".env" ]; then
  echo "⚙️ Creating environment file..."
  cp .env.example .env
  echo "Please configure your .env file with:"
  echo "- DATABASE_URL"
  echo "- JWT_SECRET" 
  echo "- Other required variables"
fi

# 4. Database setup
echo "🗄️ Setting up database..."
npm run db:push

# 5. Seed development data
echo "🌱 Seeding development data..."
npm run seed:dev

# 6. Run tests to verify setup
echo "🧪 Running tests..."
npm test

echo "✅ Setup complete! Run 'npm run dev' to start development server"
```

### 2. Codebase Architecture Tour

**Learning Path for New Developers**:

**Day 1: Understanding the Data Model**
```javascript
// Start here: Review the database schema
// File: server/database.js
// Key concepts:
// 1. Project-centric architecture
// 2. Auto-numbering system
// 3. File visibility controls
// 4. Approval workflow structure

// Exercise: Create a new project via API and trace the data flow
const exerciseSteps = [
  '1. Create client via POST /api/clients',
  '2. Create project via POST /api/projects',
  '3. Add team member via POST /api/team',
  '4. Upload file via POST /api/files/upload',
  '5. Trace database records created'
];
```

**Day 2: API Layer Understanding**
```javascript
// Focus: RESTful API patterns
// Files: server/routes/*.js
// Key concepts:
// 1. Route organization by resource
// 2. Error handling patterns
// 3. Database query patterns
// 4. Auto-numbering implementation

// Exercise: Implement a new endpoint
const newEndpointTemplate = `
// GET /api/projects/:id/summary
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch project
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    
    if (!project.length) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // 2. Aggregate related data
    const summary = await aggregateProjectData(id);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project summary'
    });
  }
});
`;
```

**Day 3: Frontend Integration**
```javascript
// Focus: React component structure
// Files: src/components/*, src/pages/*
// Key concepts:
// 1. Component hierarchy
// 2. State management patterns
// 3. API integration via services
// 4. Routing structure

// Exercise: Create a new component
const componentTemplate = `
// src/components/ProjectSummaryCard.jsx
import React, { useState, useEffect } from 'react';
import { projectApi } from '../services/api';

const ProjectSummaryCard = ({ projectId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await projectApi.getSummary(projectId);
        setSummary(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold">{summary.title}</h3>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <span className="text-gray-500">Progress</span>
          <div className="text-2xl font-bold">{summary.progress}%</div>
        </div>
        <div>
          <span className="text-gray-500">Budget Used</span>
          <div className="text-2xl font-bold">
            ${summary.spent} / ${summary.budget}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummaryCard;
`;
```

**Week 1: Development Workflow**
```bash
# Daily development routine
git checkout -b feature/your-feature-name
npm run dev        # Start development servers
npm run test:watch # Run tests in watch mode

# Make changes...
git add .
git commit -m "feat: add project summary card component"
git push origin feature/your-feature-name

# Create pull request
# Code review process
# Merge to main
```

### 3. Testing Workflow

**Test-Driven Development Process**:
```javascript
// 1. Write failing test first
describe('ProjectSummaryService', () => {
  it('should calculate project progress correctly', async () => {
    // Arrange
    const project = await createTestProject();
    await createTestMilestone({ projectId: project.id, progress: 75 });
    await createTestMilestone({ projectId: project.id, progress: 25 });
    
    // Act
    const summary = await ProjectSummaryService.calculate(project.id);
    
    // Assert
    expect(summary.averageProgress).toBe(50);
  });
});

// 2. Run test - should fail
npm test -- --watch ProjectSummaryService

// 3. Implement minimum code to pass
class ProjectSummaryService {
  static async calculate(projectId) {
    const milestones = await getMilestones(projectId);
    const averageProgress = milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length;
    return { averageProgress };
  }
}

// 4. Run test - should pass
// 5. Refactor if needed
// 6. Repeat for next feature
```

**Code Review Checklist**:
```markdown
## Code Review Checklist

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

### Testing
- [ ] New code has corresponding tests
- [ ] Tests cover happy path and edge cases
- [ ] Tests are readable and maintainable
- [ ] Test names clearly describe what they test

### Security
- [ ] Input validation is present
- [ ] SQL injection prevention
- [ ] File upload security (if applicable)
- [ ] Authorization checks (when auth is implemented)

### Code Quality
- [ ] Code follows established patterns
- [ ] Functions are focused and single-purpose
- [ ] Variable names are descriptive
- [ ] Comments explain why, not what

### Documentation
- [ ] API changes are documented
- [ ] README updated if needed
- [ ] Breaking changes are noted
```

---

## CI/CD Pipeline Recommendation

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: firelynx_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Setup test database
      run: npm run db:push
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/firelynx_test
    
    - name: Run tests
      run: npm run test:coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/firelynx_test
        NODE_ENV: test
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/firelynx_test
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/firelynx_test

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "Deploy to staging environment"
        # Add deployment steps here
    
    - name: Run smoke tests
      run: npm run test:smoke
      env:
        API_BASE_URL: ${{ secrets.STAGING_API_URL }}
    
    - name: Deploy to production
      if: success()
      run: |
        echo "Deploy to production environment"
        # Add production deployment steps here
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/index.js",
    "client": "vite",
    "build": "vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:smoke": "jest --testPathPattern=smoke",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "db:push": "drizzle-kit push:pg",
    "db:generate": "drizzle-kit generate:pg",
    "seed:dev": "node scripts/seed-development.js",
    "seed:test": "node scripts/seed-test.js"
  }
}
```

---

## Documentation Standards

### API Documentation

**OpenAPI Specification Maintenance**:
```javascript
// scripts/generate-api-docs.js
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FireLynx API',
      version: '1.0.0',
    },
  },
  apis: ['./server/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
fs.writeFileSync('./docs/api-spec.json', JSON.stringify(specs, null, 2));
console.log('API documentation generated');
```

**Code Documentation Standards**:
```javascript
/**
 * Creates a new project with validation and auto-assignment features
 * 
 * @param {Object} projectData - Project creation data
 * @param {string} projectData.title - Project title (required)
 * @param {string} projectData.clientId - Client UUID (required)
 * @param {string} [projectData.description] - Project description
 * @param {decimal} [projectData.budget] - Project budget
 * @param {Date} [projectData.startDate] - Project start date
 * 
 * @returns {Promise<Object>} Created project with generated ID
 * @throws {ValidationError} When required fields are missing
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * const project = await createProject({
 *   title: 'Modern Office Design',
 *   clientId: 'uuid-string',
 *   budget: '75000.00'
 * });
 */
async function createProject(projectData) {
  // Implementation...
}
```

---

## Knowledge Transfer Sessions

### Weekly Learning Schedule

**Week 1: Foundation**
- Day 1: Database schema and relationships
- Day 2: API architecture and patterns
- Day 3: Frontend component structure
- Day 4: Auto-numbering system deep dive
- Day 5: File management and security

**Week 2: Development Workflow**
- Day 1: Git workflow and branching strategy
- Day 2: Testing methodology and TDD
- Day 3: Code review process
- Day 4: Debugging techniques
- Day 5: Performance optimization

**Week 3: Advanced Topics**
- Day 1: Security best practices
- Day 2: PDF generation system
- Day 3: Error handling patterns
- Day 4: Deployment and monitoring
- Day 5: Project planning and estimation

### Mentorship Program

**Buddy System Structure**:
```javascript
const mentorshipProgram = {
  duration: '3 months',
  structure: {
    week1: {
      focus: 'Environment setup and basic understanding',
      activities: [
        'Code walkthrough sessions',
        'Pair programming on simple features', 
        'Daily check-ins'
      ]
    },
    week2to4: {
      focus: 'Hands-on development',
      activities: [
        'Feature implementation with guidance',
        'Code review participation',
        'Testing workshop'
      ]
    },
    week5to12: {
      focus: 'Independent development',
      activities: [
        'Lead small features',
        'Mentor newer developers',
        'Contribute to architecture decisions'
      ]
    }
  }
};
```

---

*Generated: Phase 5 of 6 - Testing Strategy & Developer Onboarding*  
*Complete framework for quality assurance and team scaling*  
*All recommendations based on industry best practices for Node.js/React applications*