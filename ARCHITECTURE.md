# FireLynx System Architecture

## Overview

FireLynx is a comprehensive project management platform designed for interior design studios and creative businesses. The system follows a **project-centric architecture** where all operations—from client management to invoicing—revolve around individual projects, with separate **Manager Portal** and **Client Portal** interfaces.

## System Architecture Stack

### Frontend Architecture
- **React 18** with modern hooks and concurrent features
- **Vite** as build tool with fast development server
- **Redux Toolkit** for centralized state management
- **React Router v6** for declarative routing
- **TailwindCSS** with custom design system using CSS variables
- **Component Architecture**: Reusable UI components with utility classes
- **Custom Hooks**: `useProjects`, `useMilestones` for data fetching abstraction

### Backend Architecture
- **Express.js** server with modular route structure
- **Project-Centric Data Model**: All entities store `projectId` for data isolation
- **Auto-Numbering System**: Document numbering with yearly reset (PREFIX-YYYY-####)
- **File Upload Management**: Multer-based with Sharp thumbnail generation
- **PDF Generation**: PDFKit integration for branded documents
- **Security**: Helmet, CORS, rate limiting

### Database Architecture
- **Drizzle ORM** with PostgreSQL as primary database
- **Normalized Schema**: 14 core tables with proper relationships
- **Auto-Numbering**: Document counters with yearly reset mechanism
- **File Storage**: Local filesystem with organized uploads/thumbnails
- **Visibility Controls**: Client/internal access control system

## Core Database Schema

### Primary Entities

| Table | Purpose | Key Relationships |
|-------|---------|------------------|
| **clients** | Customer information | → projects |
| **users** | Team member details | → projectTeam, fileAssets |
| **projects** | Central project entity | ← clients, → milestones, invoices |
| **projectTeam** | User-project associations | ← users, projects |
| **milestones** | Project milestones | ← projects, → milestoneFiles |
| **fileAssets** | General file storage | ← projects, milestones, users |
| **milestoneFiles** | Milestone-specific files | ← projects, milestones, users |
| **variationFiles** | Variation request files | ← projects, variations, users |
| **invoices** | Project invoicing | ← projects |
| **variationRequests** | Scope change management | ← projects, users |
| **approvalPackets** | Client approval workflows | ← projects |
| **approvalItems** | Individual approval items | ← approvalPackets, fileAssets |
| **tickets** | Support ticket system | ← projects, users |
| **brandingSettings** | PDF customization | Global settings |
| **documentCounters** | Auto-numbering system | Yearly counters |

### Data Integrity Features

1. **Foreign Key Constraints**: Proper cascading relationships
2. **Project Isolation**: All data tied to projectId for security
3. **Auto-Generated IDs**: UUID primary keys for most entities
4. **Timestamp Tracking**: Created/updated timestamps on all entities
5. **Status Management**: Consistent status fields across entities

## File Management System

### Three-Tier File Architecture

1. **fileAssets** - General project files with milestone/ticket associations
2. **milestoneFiles** - Dedicated milestone document management  
3. **variationFiles** - Variation request attachments

### File Processing Pipeline

1. **Upload**: Multer handles multipart uploads
2. **Storage**: Organized filesystem structure (`/uploads`, `/thumbnails`, `/previews`)
3. **Thumbnails**: Sharp generates optimized previews for images
4. **Visibility**: Client/internal access control per file
5. **Status**: Pending/accepted/declined workflow states

## Auto-Numbering System

### Document Types
- **Invoices**: `INV-YYYY-####`
- **Variations**: `VR-YYYY-####`  
- **Approvals**: `AP-YYYY-####`
- **Tickets**: `TK-YYYY-####`

### Implementation
- Yearly counter reset via `documentCounters` table
- Atomic number generation to prevent conflicts
- Consistent formatting across all document types

## Portal Architecture

### Manager Portal Features
- Full CRUD operations on all entities
- Advanced filtering and search capabilities
- Team management and role assignments
- PDF generation and document workflows
- File upload and visibility management
- Global variation and approval oversight

### Client Portal Features  
- Read-only project access with filtered data
- Milestone progress and file viewing
- Variation request review and approval
- Invoice viewing and payment status
- Approval packet decision workflows
- Branded PDF downloads

### Data Flow Separation
- **Manager**: Full database access through all API endpoints
- **Client**: Filtered access through client-specific endpoints with visibility controls
- **Shared**: PDF generation, file downloads with proper authorization

## API Architecture

### Route Organization
```
/api/
├── projects/           # Project CRUD operations
├── team/              # Team management  
├── milestones/        # Milestone CRUD + file uploads
├── milestone-files/   # Dedicated milestone file management
├── files/             # General file operations
├── invoices/          # Invoice lifecycle management
├── variations/        # Variation request workflows
├── approvals/         # Approval packet management
├── tickets/           # Support ticket system
├── branding/          # PDF customization settings
├── pdf/               # Modern HTML-based PDF generation
└── pdf-legacy/        # Legacy PDFKit-based generation
```

### API Design Patterns
- **RESTful conventions** with consistent response formats
- **Project-scoped endpoints** (e.g., `/variations/project/:projectId`)
- **Action endpoints** for workflows (e.g., `/invoices/:id/send`)
- **File upload endpoints** with multipart form handling
- **Error handling** with structured error responses

## Security Model

### Authentication & Authorization
- Development environment with placeholder authentication
- Role-based access control structure (users.role, projectTeam.role)
- Team member management with project-specific permissions

### Data Security
- **Visibility Controls**: Client/internal file access restrictions
- **Project Isolation**: All data scoped to specific projects
- **Input Validation**: Request body validation on all endpoints
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: API abuse protection

### File Security
- Organized file storage preventing directory traversal
- Visibility-based access control for client portal
- Secure file upload with type validation

## Performance Considerations

### Database Optimization
- **Indexed Foreign Keys**: Optimized joins between related tables
- **Connection Pooling**: PostgreSQL pool with configurable limits
- **Query Optimization**: Select only required fields, proper ordering

### File Handling
- **Thumbnail Generation**: Optimized image processing with Sharp
- **Storage Organization**: Structured directory layout for faster access
- **Preview Generation**: Lazy loading of file previews

### Frontend Optimization
- **Code Splitting**: Route-based code splitting with React Router
- **State Management**: Efficient Redux state with normalized data
- **Component Memoization**: React.memo for expensive re-renders

## Deployment Architecture

### Development Environment
- **Backend**: Express server on port 3001
- **Frontend**: Vite dev server on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Local filesystem

### Production Considerations
- **Database**: Managed PostgreSQL instance
- **File Storage**: Cloud storage integration (S3, etc.)
- **PDF Generation**: Server-side rendering for branded documents
- **Security**: Authentication provider integration
- **Monitoring**: Error tracking and performance monitoring

## Extension Points

### Plugin Architecture
- **PDF Templates**: Customizable document layouts
- **File Processors**: Additional file type support
- **Notification System**: Email/SMS integration ready
- **Payment Integration**: Invoice payment processing
- **API Integrations**: External service connections

### Scalability Features
- **Microservice Ready**: Modular route structure for service extraction
- **Database Sharding**: Project-based data isolation supports sharding
- **File Storage**: Pluggable storage backends
- **Caching Layer**: Redis integration points identified

## Technology Dependencies

### Core Runtime
- Node.js with Express.js framework
- PostgreSQL database with Drizzle ORM
- React 18 with modern hooks

### File Processing
- **Sharp**: High-performance image processing
- **Multer**: Multipart form handling
- **PDFKit**: Server-side PDF generation

### UI/UX Libraries
- **TailwindCSS**: Utility-first styling
- **Lucide React**: Consistent iconography
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization

### Development Tools
- **Vite**: Fast build tooling
- **Drizzle Kit**: Database schema management
- **Jest**: Unit testing framework

---

*Last Updated: September 10, 2025*
*Architecture Version: 1.0.0*