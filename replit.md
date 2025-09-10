# FireLynx Project Management Platform

## Overview

FireLynx is a comprehensive project management platform designed specifically for interior design studios and creative businesses. The system implements a project-centric architecture where all operations—from client management to financial tracking—revolve around individual projects. It provides dual portals: a Manager portal with full read-write access and a Client portal with read-only access to project information and client-visible files.

The platform handles complete project lifecycles including milestone tracking, file management with visibility controls, financial operations (invoicing, variations), approval workflows, and support ticketing. It features auto-numbering systems with yearly resets for all document types (INV-YYYY-####, VR-YYYY-####, etc.) and provides branded PDF generation for professional client communications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses **React 18** with modern concurrent features and **Vite** for fast development builds. State management is handled through **Redux Toolkit** for global state and **React Query** (@tanstack/react-query) for server state management and caching. Navigation uses **React Router v6** with declarative routing patterns.

The styling system employs **TailwindCSS** with a custom design system built on CSS variables, allowing for consistent theming across the application. **Framer Motion** provides smooth animations and transitions. The component architecture follows a utility-first approach with reusable UI primitives stored in `src/components/ui/` and feature-specific components organized by domain.

Custom hooks like `useProjects`, `useMilestones`, and `useMilestoneFiles` abstract data fetching logic and provide consistent interfaces for component consumption. The frontend implements comprehensive error handling and loading states for all API interactions.

### Backend Architecture
The backend is built on **Express.js** with a modular route structure organized by domain (`/routes/projects.js`, `/routes/milestones.js`, etc.). The server implements comprehensive security middleware including **Helmet** for HTTP header security, **CORS** for cross-origin resource sharing, and **express-rate-limit** for API protection.

The project-centric data model ensures data isolation where all entities store a `projectId` for proper data scoping. File uploads are handled through **Multer** with **Sharp** for automatic thumbnail generation. The system supports various file types including images, PDFs, CAD files (.dwg, .dxf), and office documents.

PDF generation uses **PDFKit** for reliable document creation with branded templates for invoices, variation requests, and approval packets. The auto-numbering system implements yearly counters for all document types with proper concurrency handling.

### Database Design
The system uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations. The schema consists of 14 core tables with proper foreign key relationships and constraints.

Key tables include:
- **projects**: Central entity containing project metadata, budgets, and timelines
- **clients**: Customer information linked to projects
- **users**: Team member details with role-based capabilities
- **milestones**: Project milestone tracking with file associations
- **fileAssets**: General file storage with visibility controls (client/internal)
- **invoices**, **variationRequests**, **approvalPackets**, **tickets**: Document entities with auto-numbering
- **documentCounters**: Yearly auto-numbering system management

The database implements proper indexing for performance and uses UUIDs for all primary keys to ensure uniqueness across distributed systems.

### File Management System
Files are stored locally in the `uploads/` directory with organized subdirectories by type (thumbnails, previews, variations, etc.). The system automatically generates thumbnails for images using Sharp and implements visibility controls to separate client-visible files from internal documentation.

File operations support drag-and-drop uploads, progress tracking, and preview generation. The system handles various file types with appropriate validation and size limits (50MB for general files, 5MB for logos).

### Security Architecture
**Critical Gap**: The system currently lacks authentication and authorization mechanisms. All API endpoints are publicly accessible without user verification or role-based access controls. This represents a significant security vulnerability that needs immediate attention.

When implemented, the security model should include JWT-based authentication, role-based authorization (Manager/Designer/Client), and API endpoint protection with proper session management.

## External Dependencies

### Core Dependencies
- **Node.js Runtime**: Server execution environment
- **PostgreSQL Database**: Primary data storage requiring connection via DATABASE_URL environment variable
- **Express.js Framework**: HTTP server and API routing
- **React Framework**: Frontend user interface library
- **Vite Build Tool**: Frontend development and production builds

### Database & ORM
- **Drizzle ORM**: Type-safe database operations and migrations
- **Drizzle Kit**: Database migration and schema management
- **node-postgres (pg)**: PostgreSQL connection driver with connection pooling

### File Processing
- **Multer**: Multipart form data and file upload handling
- **Sharp**: Image processing, thumbnail generation, and optimization
- **PDFKit**: Server-side PDF document generation for branded outputs

### Security & Middleware
- **Helmet**: HTTP security headers and XSS protection
- **CORS**: Cross-origin resource sharing configuration
- **express-rate-limit**: API rate limiting and DDoS protection

### UI & Styling
- **TailwindCSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible UI component primitives
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation and transition library

### Development Tools
- **ESLint & Prettier**: Code quality and formatting (if configured)
- **Autoprefixer**: CSS vendor prefix automation
- **PostCSS**: CSS processing and transformation

### Email & Communication
- **Nodemailer**: Email sending capabilities for notifications and client communications

### Environment Configuration
The system requires environment variables for database connection (DATABASE_URL), server port configuration, and any API keys for external services. The application is configured for deployment on Replit with appropriate proxy settings for development and production environments.