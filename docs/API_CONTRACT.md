# FireLynx API Contract & OpenAPI Specification

## Summary

This document provides the complete OpenAPI 3.0 specification for the FireLynx interior design management platform. The API follows RESTful principles with project-centric resource organization and auto-numbering document management.

## How to Use This Doc

- **Quick Reference**: Endpoint summary table for finding specific routes
- **OpenAPI Spec**: Complete specification for API client generation
- **Request/Response Examples**: Real payload examples from the codebase
- **Error Handling**: Standardized error response formats

---

## API Endpoint Summary

**Citations**: `server/index.js:214-226`, All route files in `server/routes/`

### Core Resource Management

| Resource | Endpoints | Purpose | Auto-Number |
|----------|-----------|---------|-------------|
| **Projects** | 5 endpoints | Central project entity | ❌ |
| **Clients** | Part of projects | Customer management | ❌ |
| **Team** | 7 endpoints | Project team assignment | ❌ |
| **Milestones** | 8 endpoints | Project milestone tracking | ❌ |

### Document Management

| Resource | Endpoints | Purpose | Auto-Number |
|----------|-----------|---------|-------------|
| **Invoices** | 7 endpoints | Project billing | ✅ INV-YYYY-#### |
| **Variations** | 10 endpoints | Scope change requests | ✅ VR-YYYY-#### |
| **Approvals** | 5 endpoints | Client approval workflow | ✅ AP-YYYY-#### |
| **Tickets** | 10 endpoints | Support ticketing | ✅ TK-YYYY-#### |

### File Operations

| Resource | Endpoints | Purpose | Features |
|----------|-----------|---------|----------|
| **Files** | 7 endpoints | General file management | Visibility control, thumbnails |
| **Milestone Files** | 5 endpoints | Milestone-specific files | Status tracking |
| **Variation Files** | 3 endpoints | Variation attachments | Client/Internal separation |

### System Features

| Resource | Endpoints | Purpose | Features |
|----------|-----------|---------|----------|
| **PDF Generation** | 8 endpoints | Document PDF creation | HTML templates, branding |
| **Branding** | 5 endpoints | System customization | Logo, colors, fonts |
| **Admin** | 1 endpoint | System maintenance | Demo data seeding |

---

## Complete OpenAPI 3.0 Specification

**Base URL**: `https://your-domain.com/api`  
**Version**: 1.0.0

```yaml
openapi: 3.0.3
info:
  title: FireLynx Interior Design Management API
  description: |
    Complete API for managing interior design projects including:
    - Project lifecycle management
    - Client approval workflows  
    - Document generation with auto-numbering
    - File management with visibility controls
    - Team collaboration features
  version: 1.0.0
  contact:
    name: FireLynx Support
    url: https://firelynx.com/support
    email: support@firelynx.com

servers:
  - url: https://your-domain.com/api
    description: Production server
  - url: http://localhost:3001/api
    description: Development server

paths:
  # Project Management
  /projects:
    get:
      summary: List all projects
      description: Retrieve all projects with client information
      tags: [Projects]
      responses:
        '200':
          description: Projects retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ProjectWithClient'
                  count:
                    type: integer
                    example: 3
                  source:
                    type: string
                    enum: [database, mock]
                    example: database
    post:
      summary: Create new project
      description: Create a new interior design project
      tags: [Projects]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectCreateRequest'
      responses:
        '201':
          description: Project created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

  /projects/{id}:
    get:
      summary: Get project by ID
      description: Retrieve specific project with full client details
      tags: [Projects]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/ProjectWithClient'
        '404':
          $ref: '#/components/responses/NotFound'
    put:
      summary: Update project
      description: Update project details and status
      tags: [Projects]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectUpdateRequest'
      responses:
        '200':
          description: Project updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
    delete:
      summary: Delete project
      description: Permanently delete project and all related data
      tags: [Projects]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project deleted successfully
        '404':
          $ref: '#/components/responses/NotFound'

  # Invoice Management
  /invoices:
    get:
      summary: List all invoices
      description: Retrieve all invoices across all projects
      tags: [Invoices]
      responses:
        '200':
          description: Invoices retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Invoice'
                  count:
                    type: integer
    post:
      summary: Create invoice
      description: Create new invoice with auto-generated number
      tags: [Invoices]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InvoiceCreateRequest'
      responses:
        '201':
          description: Invoice created with auto-generated number
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/Invoice'
                  message:
                    type: string
                    example: "Invoice INV-2025-0001 created successfully"

  /invoices/project/{projectId}:
    get:
      summary: Get project invoices
      description: Retrieve all invoices for specific project
      tags: [Invoices]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project invoices retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Invoice'

  /invoices/{id}/send:
    post:
      summary: Send invoice to client
      description: Mark invoice as sent and trigger client notification
      tags: [Invoices]
      parameters:
        - $ref: '#/components/parameters/InvoiceId'
      responses:
        '200':
          description: Invoice sent successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'

  /invoices/{id}/payment:
    post:
      summary: Record payment
      description: Mark invoice as paid with payment details
      tags: [Invoices]
      parameters:
        - $ref: '#/components/parameters/InvoiceId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentMethod:
                  type: string
                  example: "Bank Transfer"
                paymentReference:
                  type: string
                  example: "TXN-123456"
      responses:
        '200':
          description: Payment recorded successfully

  # Variation Request Management  
  /variations:
    get:
      summary: List all variations
      description: Retrieve all variation requests across projects
      tags: [Variations]
      responses:
        '200':
          description: Variations retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/VariationRequest'
    post:
      summary: Create variation request
      description: Create new variation with auto-generated number
      tags: [Variations]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VariationCreateRequest'
      responses:
        '201':
          description: Variation created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/VariationRequest'
                  message:
                    type: string
                    example: "Variation VR-2025-0001 created successfully"

  /variations/project/{projectId}:
    get:
      summary: Get project variations
      description: Retrieve all variation requests for specific project
      tags: [Variations]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project variations retrieved

  /variations/{id}/submit:
    post:
      summary: Submit variation for approval
      description: Submit variation request to client for approval
      tags: [Variations]
      parameters:
        - $ref: '#/components/parameters/VariationId'
      responses:
        '200':
          description: Variation submitted for client approval

  /variations/{id}/approve:
    post:
      summary: Approve variation (Client action)
      description: Client approval of variation request
      tags: [Variations]
      parameters:
        - $ref: '#/components/parameters/VariationId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                clientComment:
                  type: string
                  example: "Approved - please proceed with the changes"
      responses:
        '200':
          description: Variation approved by client

  /variations/{id}/decline:
    post:
      summary: Decline variation (Client action)
      description: Client decline of variation request
      tags: [Variations]
      parameters:
        - $ref: '#/components/parameters/VariationId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [clientComment]
              properties:
                clientComment:
                  type: string
                  example: "Cannot approve due to budget constraints"
      responses:
        '200':
          description: Variation declined by client

  /variations/options:
    get:
      summary: Get variation options
      description: Retrieve available work types and categories for variations
      tags: [Variations]
      responses:
        '200':
          description: Variation options retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      workTypes:
                        type: array
                        items:
                          type: string
                        example: ["Design", "Structural", "Electrical", "Plumbing"]
                      categories:
                        type: array
                        items:
                          type: string
                        example: ["Cost", "Time", "Quality", "Scope"]

  # File Management
  /files/project/{projectId}:
    get:
      summary: Get project files
      description: Retrieve all files for project with optional visibility filter
      tags: [Files]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
        - name: visibility
          in: query
          description: Filter by file visibility
          schema:
            type: string
            enum: [Client, Internal]
      responses:
        '200':
          description: Project files retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/FileAsset'
                  count:
                    type: integer

  /files/upload:
    post:
      summary: Upload files
      description: Upload multiple files to project (50MB limit per file)
      tags: [Files]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                files:
                  type: array
                  items:
                    type: string
                    format: binary
                projectId:
                  type: string
                  format: uuid
                visibility:
                  type: string
                  enum: [Client, Internal]
                  default: Client
                milestoneId:
                  type: string
                  format: uuid
                  description: Optional milestone association
      responses:
        '201':
          description: Files uploaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  uploadedFiles:
                    type: array
                    items:
                      $ref: '#/components/schemas/FileAsset'
                  message:
                    type: string

  /files/{fileId}/visibility:
    put:
      summary: Update file visibility
      description: Change file visibility between Client and Internal
      tags: [Files]
      parameters:
        - $ref: '#/components/parameters/FileId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [visibility]
              properties:
                visibility:
                  type: string
                  enum: [Client, Internal]
      responses:
        '200':
          description: File visibility updated

  /files/{fileId}/download:
    get:
      summary: Download file
      description: Download file with appropriate headers
      tags: [Files]
      parameters:
        - $ref: '#/components/parameters/FileId'
      responses:
        '200':
          description: File download
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary

  # PDF Generation
  /pdf/invoice/{invoiceId}:
    get:
      summary: Generate invoice PDF
      description: Generate branded PDF invoice using HTML templates
      tags: [PDF Generation]
      parameters:
        - $ref: '#/components/parameters/InvoiceId'
      responses:
        '200':
          description: PDF generated successfully
          content:
            application/pdf:
              schema:
                type: string
                format: binary

  /pdf/invoice/{invoiceId}/preview:
    get:
      summary: Preview invoice HTML
      description: Preview invoice as HTML before PDF generation
      tags: [PDF Generation]
      parameters:
        - $ref: '#/components/parameters/InvoiceId'
      responses:
        '200':
          description: Invoice HTML preview
          content:
            text/html:
              schema:
                type: string

  /pdf/variation/{variationId}:
    get:
      summary: Generate variation PDF
      description: Generate branded PDF for variation request
      tags: [PDF Generation]
      parameters:
        - $ref: '#/components/parameters/VariationId'
      responses:
        '200':
          description: Variation PDF generated
          content:
            application/pdf:
              schema:
                type: string
                format: binary

  # Approval Management
  /approvals/project/{projectId}:
    get:
      summary: Get project approvals
      description: Retrieve all approval packets for project
      tags: [Approvals]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project approvals retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ApprovalPacket'

  /approvals:
    post:
      summary: Create approval packet
      description: Create new approval packet with auto-generated number
      tags: [Approvals]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApprovalCreateRequest'
      responses:
        '201':
          description: Approval packet created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/ApprovalPacket'
                  message:
                    type: string
                    example: "Approval AP-2025-0001 created successfully"

  /approvals/{id}/send:
    post:
      summary: Send approval to client
      description: Send approval packet to client for review
      tags: [Approvals]
      parameters:
        - $ref: '#/components/parameters/ApprovalId'
      responses:
        '200':
          description: Approval sent to client

  /approvals/{id}/decision:
    post:
      summary: Record approval decision
      description: Record client's approval or decline decision
      tags: [Approvals]
      parameters:
        - $ref: '#/components/parameters/ApprovalId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [decision]
              properties:
                decision:
                  type: string
                  enum: [Approved, Declined]
                comment:
                  type: string
                  description: Required when declining
                signatureName:
                  type: string
                  description: Client signature name for approval
      responses:
        '200':
          description: Decision recorded successfully

  # Team Management
  /team/users:
    get:
      summary: Get all users
      description: Retrieve all available team members
      tags: [Team]
      responses:
        '200':
          description: Users retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'

  /team/project/{projectId}:
    get:
      summary: Get project team
      description: Retrieve team members assigned to specific project
      tags: [Team]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project team retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/TeamMember'

  /team:
    post:
      summary: Add team member
      description: Add user to project team with specific role
      tags: [Team]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [projectId, userId, role]
              properties:
                projectId:
                  type: string
                  format: uuid
                userId:
                  type: string
                  format: uuid
                role:
                  type: string
                  example: "Interior Designer"
      responses:
        '201':
          description: Team member added successfully

  /team/{teamMemberId}:
    delete:
      summary: Remove team member
      description: Remove team member from project
      tags: [Team]
      parameters:
        - $ref: '#/components/parameters/TeamMemberId'
      responses:
        '200':
          description: Team member removed

  /team/{teamMemberId}/role:
    put:
      summary: Update team member role
      description: Update the role of existing team member
      tags: [Team]
      parameters:
        - $ref: '#/components/parameters/TeamMemberId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [role]
              properties:
                role:
                  type: string
                  example: "Senior Designer"
      responses:
        '200':
          description: Team member role updated

  # Milestone Management
  /milestones:
    get:
      summary: Get milestones
      description: Retrieve milestones with optional project filter
      tags: [Milestones]
      parameters:
        - name: projectId
          in: query
          description: Filter by project ID
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Milestones retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Milestone'
                  count:
                    type: integer
    post:
      summary: Create milestone
      description: Create new project milestone
      tags: [Milestones]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MilestoneCreateRequest'
      responses:
        '201':
          description: Milestone created successfully

  /milestones/{id}:
    put:
      summary: Update milestone
      description: Update milestone details and progress
      tags: [Milestones]
      parameters:
        - $ref: '#/components/parameters/MilestoneId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MilestoneUpdateRequest'
      responses:
        '200':
          description: Milestone updated successfully
    delete:
      summary: Delete milestone
      description: Delete milestone and associated files
      tags: [Milestones]
      parameters:
        - $ref: '#/components/parameters/MilestoneId'
      responses:
        '200':
          description: Milestone deleted successfully

  /milestones/{id}/upload:
    post:
      summary: Upload milestone files
      description: Upload files directly to milestone
      tags: [Milestones]
      parameters:
        - $ref: '#/components/parameters/MilestoneId'
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                files:
                  type: array
                  items:
                    type: string
                    format: binary
                uploadedByUserId:
                  type: string
                  format: uuid
                visibility:
                  type: string
                  enum: [Client, Internal]
                  default: Client
      responses:
        '201':
          description: Files uploaded to milestone

  # Ticket Management
  /tickets:
    get:
      summary: List all tickets
      description: Retrieve all support tickets across projects
      tags: [Tickets]
      responses:
        '200':
          description: Tickets retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Ticket'
    post:
      summary: Create ticket
      description: Create new support ticket with auto-generated number
      tags: [Tickets]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TicketCreateRequest'
      responses:
        '201':
          description: Ticket created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/Ticket'
                  message:
                    type: string
                    example: "Ticket TK-2025-0001 created successfully"

  /tickets/project/{projectId}:
    get:
      summary: Get project tickets
      description: Retrieve all tickets for specific project
      tags: [Tickets]
      parameters:
        - $ref: '#/components/parameters/ProjectId'
      responses:
        '200':
          description: Project tickets retrieved

  /tickets/{id}/assign:
    post:
      summary: Assign ticket
      description: Assign ticket to team member
      tags: [Tickets]
      parameters:
        - $ref: '#/components/parameters/TicketId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [assigneeUserId]
              properties:
                assigneeUserId:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Ticket assigned successfully

  /tickets/{id}/status:
    post:
      summary: Update ticket status
      description: Change ticket status in workflow
      tags: [Tickets]
      parameters:
        - $ref: '#/components/parameters/TicketId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [Open, In Progress, Awaiting Client, Resolved, Closed]
      responses:
        '200':
          description: Ticket status updated

  /tickets/priorities:
    get:
      summary: Get ticket priorities
      description: Retrieve available ticket priority levels
      tags: [Tickets]
      responses:
        '200':
          description: Ticket priorities retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: string
                    example: ["Low", "Medium", "High", "Critical"]

  /tickets/categories:
    get:
      summary: Get ticket categories
      description: Retrieve available ticket categories
      tags: [Tickets]
      responses:
        '200':
          description: Ticket categories retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: string
                    example: ["Design Issue", "Technical Problem", "Client Request", "Budget Query"]

  # Branding Management
  /branding:
    get:
      summary: Get branding settings
      description: Retrieve current system branding configuration
      tags: [Branding]
      responses:
        '200':
          description: Branding settings retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/BrandingSettings'
    put:
      summary: Update branding settings
      description: Update system branding colors, fonts, and PDF settings
      tags: [Branding]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BrandingUpdateRequest'
      responses:
        '200':
          description: Branding settings updated

  /branding/logo:
    post:
      summary: Upload logo
      description: Upload new company logo (optimized automatically)
      tags: [Branding]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                logo:
                  type: string
                  format: binary
                  description: Logo file (PNG, JPG, SVG)
      responses:
        '200':
          description: Logo uploaded and optimized
    delete:
      summary: Remove logo
      description: Remove current company logo
      tags: [Branding]
      responses:
        '200':
          description: Logo removed successfully

  /branding/preview:
    get:
      summary: Preview branding
      description: Get preview of branded document with current settings
      tags: [Branding]
      responses:
        '200':
          description: Branding preview generated

  # Health & Admin
  /health:
    get:
      summary: Health check
      description: API health status and system information
      tags: [System]
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: healthy
                  timestamp:
                    type: string
                    format: date-time
                  environment:
                    type: string
                    example: development

components:
  schemas:
    # Core Data Models
    ProjectWithClient:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "5fd51f59-f935-45b6-8323-e917214903fe"
        title:
          type: string
          example: "Modern Downtown Loft"
        description:
          type: string
          example: "Contemporary loft design with open concept living"
        status:
          type: string
          enum: [Planning, In Progress, On Hold, Completed, Cancelled]
          example: "In Progress"
        priority:
          type: string
          enum: [Low, Medium, High, Critical]
          example: "Medium"
        budget:
          type: string
          format: decimal
          example: "150000.00"
        spent:
          type: string
          format: decimal
          example: "102000.00"
        progress:
          type: integer
          minimum: 0
          maximum: 100
          example: 68
        startDate:
          type: string
          format: date-time
          nullable: true
        targetDate:
          type: string
          format: date-time
          nullable: true
        completedDate:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        clientName:
          type: string
          example: "Sarah Mitchell"
        clientEmail:
          type: string
          format: email
          example: "sarah.mitchell@email.com"
        clientCompany:
          type: string
          example: "Mitchell Properties"

    Invoice:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        number:
          type: string
          example: "INV-2025-0001"
          description: "Auto-generated unique invoice number"
        issueDate:
          type: string
          format: date-time
        dueDate:
          type: string
          format: date-time
        currency:
          type: string
          default: "USD"
          example: "USD"
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/InvoiceLineItem'
        subtotal:
          type: string
          format: decimal
        taxTotal:
          type: string
          format: decimal
        total:
          type: string
          format: decimal
        status:
          type: string
          enum: [Draft, Sent, Paid, Overdue, Cancelled]
          default: "Draft"
        sentAt:
          type: string
          format: date-time
          nullable: true
        paidAt:
          type: string
          format: date-time
          nullable: true
        notes:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    InvoiceLineItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
        description:
          type: string
          example: "Interior Design Services"
        quantity:
          type: number
          example: 40
        rate:
          type: number
          format: decimal
          example: 125.00
        taxPercent:
          type: number
          format: decimal
          example: 10.0
        amount:
          type: number
          format: decimal
          description: "Calculated: quantity * rate"

    VariationRequest:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        number:
          type: string
          example: "VR-2025-0001"
          description: "Auto-generated variation number"
        date:
          type: string
          format: date-time
        changeRequestor:
          type: string
          example: "Sarah Mitchell"
        changeReference:
          type: string
          example: "Exposed Brick Wall Feature"
        changeArea:
          type: string
          example: "Main Living Area"
        workTypes:
          type: array
          items:
            type: string
          example: ["Structural", "Demolition"]
        categories:
          type: array
          items:
            type: string
          example: ["Design", "Cost"]
        changeDescription:
          type: string
        reasonDescription:
          type: string
        technicalChanges:
          type: string
          nullable: true
        resourcesAndCosts:
          type: string
          nullable: true
        disposition:
          type: string
          nullable: true
        dispositionReason:
          type: string
          nullable: true
        status:
          type: string
          enum: [draft, submitted, approved, declined]
          default: "draft"
        attachments:
          type: array
          items:
            type: string
            format: uuid
          nullable: true
        materialCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        laborCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        additionalCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        currency:
          type: string
          default: "AED"
        title:
          type: string
          nullable: true
        priority:
          type: string
          enum: [low, medium, high]
          default: "medium"
        priceImpact:
          type: string
          format: decimal
          default: "0.00"
        timeImpact:
          type: integer
          default: 0
          description: "Impact in days"
        submittedAt:
          type: string
          format: date-time
          nullable: true
        decidedAt:
          type: string
          format: date-time
          nullable: true
        decidedBy:
          type: string
          format: uuid
          nullable: true
        clientComment:
          type: string
          nullable: true
        invoiceId:
          type: string
          format: uuid
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CostItem:
      type: object
      properties:
        description:
          type: string
          example: "Premium ceramic tiles"
        quantity:
          type: number
          example: 50
        unitRate:
          type: number
          format: decimal
          example: 45.00
        total:
          type: number
          format: decimal
          example: 2250.00

    FileAsset:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        milestoneId:
          type: string
          format: uuid
          nullable: true
        ticketId:
          type: string
          format: uuid
          nullable: true
        uploadedByUserId:
          type: string
          format: uuid
        filename:
          type: string
          example: "living_area_layout.jpg"
        originalName:
          type: string
          example: "Living Area Layout Design.jpg"
        url:
          type: string
          example: "/uploads/living_area_layout.jpg"
        contentType:
          type: string
          example: "image/jpeg"
        size:
          type: integer
          example: 950000
          description: "File size in bytes"
        visibility:
          type: string
          enum: [Client, Internal]
          default: "Client"
        createdAt:
          type: string
          format: date-time
        uploadedByName:
          type: string
          example: "Alice Cooper"
          description: "Populated via JOIN"
        uploadedByEmail:
          type: string
          format: email
          example: "alice@firelynx.com"
          description: "Populated via JOIN"

    ApprovalPacket:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        number:
          type: string
          example: "AP-2025-0001"
          description: "Auto-generated approval number"
        title:
          type: string
          example: "Living Area Design Approval"
        description:
          type: string
        dueDate:
          type: string
          format: date-time
        status:
          type: string
          enum: [Pending, Sent, Approved, Declined, Expired]
          default: "Pending"
        sentAt:
          type: string
          format: date-time
          nullable: true
        decidedAt:
          type: string
          format: date-time
          nullable: true
        clientComment:
          type: string
          nullable: true
        signatureName:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        items:
          type: array
          items:
            $ref: '#/components/schemas/ApprovalItem'

    ApprovalItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
        packetId:
          type: string
          format: uuid
        fileAssetId:
          type: string
          format: uuid
        decision:
          type: string
          enum: [Pending, Approved, Declined]
          default: "Pending"
        comment:
          type: string
          nullable: true
        decidedAt:
          type: string
          format: date-time
          nullable: true
        filename:
          type: string
          description: "Populated via JOIN with fileAssets"
        originalName:
          type: string
          description: "Populated via JOIN with fileAssets"
        url:
          type: string
          description: "Populated via JOIN with fileAssets"
        contentType:
          type: string
          description: "Populated via JOIN with fileAssets"
        size:
          type: integer
          description: "Populated via JOIN with fileAssets"
        visibility:
          type: string
          description: "Populated via JOIN with fileAssets"

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          example: "Alice Cooper"
        email:
          type: string
          format: email
          example: "alice@firelynx.com"
        phone:
          type: string
          nullable: true
        role:
          type: string
          example: "Interior Designer"
        specialization:
          type: string
          nullable: true
          example: "Residential Design"
        avatar:
          type: string
          nullable: true
        isOnline:
          type: boolean
          default: false
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    TeamMember:
      type: object
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            teamRole:
              type: string
              example: "Project Lead"
              description: "Role within this specific project"
            addedAt:
              type: string
              format: date-time

    Milestone:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
          example: "Space Planning"
        description:
          type: string
          example: "Layout optimization and space utilization planning"
        status:
          type: string
          enum: [Pending, In Progress, Completed]
          default: "Pending"
        progress:
          type: integer
          minimum: 0
          maximum: 100
          default: 0
        expectedDate:
          type: string
          format: date-time
          nullable: true
        completedDate:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        fileCount:
          type: integer
          description: "Number of associated files"
        files:
          type: array
          items:
            $ref: '#/components/schemas/FileAsset'

    Ticket:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        number:
          type: string
          example: "TK-2025-0001"
          description: "Auto-generated ticket number"
        subject:
          type: string
          example: "Color scheme adjustment request"
        description:
          type: string
        category:
          type: string
          example: "Design Issue"
        priority:
          type: string
          enum: [Low, Medium, High, Critical]
          default: "Medium"
        status:
          type: string
          enum: [Open, In Progress, Awaiting Client, Resolved, Closed]
          default: "Open"
        assigneeUserId:
          type: string
          format: uuid
          nullable: true
        requesterUserId:
          type: string
          format: uuid
        attachments:
          type: array
          items:
            type: string
            format: uuid
          description: "Array of file asset IDs"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        requesterName:
          type: string
          description: "Populated via JOIN"
        requesterEmail:
          type: string
          format: email
          description: "Populated via JOIN"
        assigneeName:
          type: string
          nullable: true
          description: "Populated via JOIN"
        assigneeEmail:
          type: string
          format: email
          nullable: true
          description: "Populated via JOIN"

    BrandingSettings:
      type: object
      properties:
        id:
          type: string
          format: uuid
        appName:
          type: string
          default: "FireLynx"
        logoUrl:
          type: string
          nullable: true
        accentColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          default: "#4C6FFF"
        primaryTextColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          default: "#0F172A"
        mutedTextColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          default: "#64748B"
        borderColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          default: "#E2E8F0"
        bgSoft:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          default: "#F8FAFC"
        fontFamily:
          type: string
          default: "Inter, system-ui, Roboto, Helvetica, Arial"
        footerLeft:
          type: string
          default: "FireLynx Interior Design Studio"
        footerRight:
          type: string
          default: "support@firelynx.com • +1 (555) 123-4567"
        watermarkEnabled:
          type: boolean
          default: false
        watermarkText:
          type: string
          default: "DRAFT"
        watermarkOpacity:
          type: string
          format: decimal
          default: "0.08"
        pageSize:
          type: string
          default: "A4"
        pageMargins:
          type: string
          default: "24mm 18mm 22mm 18mm"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # Request/Response Schemas
    ProjectCreateRequest:
      type: object
      required: [clientId, title]
      properties:
        clientId:
          type: string
          format: uuid
        title:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
        status:
          type: string
          enum: [Planning, In Progress, On Hold, Completed, Cancelled]
          default: "Planning"
        priority:
          type: string
          enum: [Low, Medium, High, Critical]
          default: "Medium"
        budget:
          type: string
          format: decimal
          nullable: true
        startDate:
          type: string
          format: date-time
          nullable: true
        targetDate:
          type: string
          format: date-time
          nullable: true

    ProjectUpdateRequest:
      type: object
      properties:
        title:
          type: string
          maxLength: 255
        description:
          type: string
        status:
          type: string
          enum: [Planning, In Progress, On Hold, Completed, Cancelled]
        priority:
          type: string
          enum: [Low, Medium, High, Critical]
        budget:
          type: string
          format: decimal
          nullable: true
        spent:
          type: string
          format: decimal
        progress:
          type: integer
          minimum: 0
          maximum: 100
        startDate:
          type: string
          format: date-time
          nullable: true
        targetDate:
          type: string
          format: date-time
          nullable: true
        completedDate:
          type: string
          format: date-time
          nullable: true

    InvoiceCreateRequest:
      type: object
      required: [projectId, issueDate, dueDate, lineItems]
      properties:
        projectId:
          type: string
          format: uuid
        issueDate:
          type: string
          format: date-time
        dueDate:
          type: string
          format: date-time
        currency:
          type: string
          default: "USD"
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/InvoiceLineItem'
          minItems: 1
        notes:
          type: string
          nullable: true

    VariationCreateRequest:
      type: object
      required: [projectId, changeRequestor, changeArea, workTypes, categories, changeDescription, reasonDescription]
      properties:
        projectId:
          type: string
          format: uuid
        changeRequestor:
          type: string
        changeReference:
          type: string
          nullable: true
        changeArea:
          type: string
        workTypes:
          type: array
          items:
            type: string
          minItems: 1
        categories:
          type: array
          items:
            type: string
          minItems: 1
        changeDescription:
          type: string
        reasonDescription:
          type: string
        technicalChanges:
          type: string
          nullable: true
        resourcesAndCosts:
          type: string
          nullable: true
        materialCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        laborCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        additionalCosts:
          type: array
          items:
            $ref: '#/components/schemas/CostItem'
          nullable: true
        title:
          type: string
          nullable: true
        priority:
          type: string
          enum: [low, medium, high]
          default: "medium"

    ApprovalCreateRequest:
      type: object
      required: [projectId, title, dueDate]
      properties:
        projectId:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        dueDate:
          type: string
          format: date-time
        fileAssetIds:
          type: array
          items:
            type: string
            format: uuid
          default: []

    MilestoneCreateRequest:
      type: object
      required: [projectId, title]
      properties:
        projectId:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        expectedDate:
          type: string
          format: date-time
          nullable: true

    MilestoneUpdateRequest:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [Pending, In Progress, Completed]
        progress:
          type: integer
          minimum: 0
          maximum: 100
        expectedDate:
          type: string
          format: date-time
          nullable: true
        completedDate:
          type: string
          format: date-time
          nullable: true

    TicketCreateRequest:
      type: object
      required: [projectId, subject, description, category, requesterUserId]
      properties:
        projectId:
          type: string
          format: uuid
        subject:
          type: string
        description:
          type: string
        category:
          type: string
        priority:
          type: string
          enum: [Low, Medium, High, Critical]
          default: "Medium"
        requesterUserId:
          type: string
          format: uuid
        assigneeUserId:
          type: string
          format: uuid
          nullable: true

    BrandingUpdateRequest:
      type: object
      properties:
        appName:
          type: string
        accentColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
        primaryTextColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
        mutedTextColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
        borderColor:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
        bgSoft:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
        fontFamily:
          type: string
        footerLeft:
          type: string
        footerRight:
          type: string
        watermarkEnabled:
          type: boolean
        watermarkText:
          type: string
        watermarkOpacity:
          type: number
          minimum: 0
          maximum: 1
        pageSize:
          type: string
        pageMargins:
          type: string

    ApiResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          type: object

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          default: false
        error:
          type: string
        details:
          type: string
          nullable: true
        stack:
          type: string
          nullable: true
          description: "Only included in development environment"

  parameters:
    ProjectId:
      name: id
      in: path
      required: true
      description: Project unique identifier
      schema:
        type: string
        format: uuid

    InvoiceId:
      name: id
      in: path
      required: true
      description: Invoice unique identifier
      schema:
        type: string
        format: uuid

    VariationId:
      name: id
      in: path
      required: true
      description: Variation request unique identifier
      schema:
        type: string
        format: uuid

    ApprovalId:
      name: id
      in: path
      required: true
      description: Approval packet unique identifier
      schema:
        type: string
        format: uuid

    MilestoneId:
      name: id
      in: path
      required: true
      description: Milestone unique identifier
      schema:
        type: string
        format: uuid

    TicketId:
      name: id
      in: path
      required: true
      description: Ticket unique identifier
      schema:
        type: string
        format: uuid

    FileId:
      name: fileId
      in: path
      required: true
      description: File asset unique identifier
      schema:
        type: string
        format: uuid

    TeamMemberId:
      name: teamMemberId
      in: path
      required: true
      description: Team member assignment unique identifier
      schema:
        type: string
        format: uuid

  responses:
    BadRequest:
      description: Bad request - validation errors or missing required fields
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            missing_fields:
              summary: Missing required fields
              value:
                success: false
                error: "Missing required fields: projectId, title, dueDate"
            invalid_format:
              summary: Invalid data format
              value:
                success: false
                error: "Invalid hex color for accentColor. Use format #RRGGBB"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error: "Project not found"

    InternalError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error: "Internal server error"
            stack: "Error stack trace (development only)"

  securitySchemes:
    # Future authentication implementation
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT authentication (planned for future implementation)"

# Future security implementation
# security:
#   - BearerAuth: []

tags:
  - name: Projects
    description: Project lifecycle management
  - name: Invoices  
    description: Billing and payment tracking with auto-numbering
  - name: Variations
    description: Project scope change management
  - name: Approvals
    description: Client approval workflow management
  - name: Files
    description: File upload and management with visibility controls
  - name: Team
    description: Project team assignment and role management
  - name: Milestones
    description: Project milestone tracking and file organization
  - name: Tickets
    description: Support ticket system with assignment tracking
  - name: PDF Generation
    description: Branded document generation using HTML templates
  - name: Branding
    description: System customization and PDF branding settings
  - name: System
    description: Health checks and system administration
```

---

## Error Handling Standards

**Citations**: `server/index.js:238-259`

### Global Error Handler

All API endpoints follow consistent error response patterns:

```javascript
// Multer file upload errors
if (err instanceof multer.MulterError) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 50MB.' 
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Too many files. Maximum is 10 files per upload.' 
    });
  }
}

// Standard error response
res.status(err.status || 500).json({
  error: err.message || 'Internal server error',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

### Response Status Codes

| Code | Usage | Example |
|------|-------|---------|
| **200** | Successful GET, PUT, DELETE | Project retrieved/updated/deleted |
| **201** | Successful POST creation | Invoice INV-2025-0001 created |
| **400** | Validation errors | Missing required field: projectId |
| **404** | Resource not found | Project not found |
| **500** | Server errors | Database connection failed |

---

## Auto-Numbering Implementation

**Citations**: Auto-numbering functions in all document route files

### Document Number Format

All auto-numbered documents follow the pattern: `PREFIX-YYYY-####`

| Document Type | Prefix | Example | Counter Field |
|---------------|--------|---------|---------------|
| Invoices | INV | INV-2025-0001 | invoiceCounter |
| Variations | VR | VR-2025-0002 | variationCounter |
| Approvals | AP | AP-2025-0003 | approvalCounter |
| Tickets | TK | TK-2025-0004 | ticketCounter |

### Transaction Safety

Each document creation follows this atomic pattern:

1. **Generate Number**: Query/create yearly counter atomically
2. **Create Document**: Insert document with generated number
3. **Return Response**: Include auto-generated number in response

```javascript
// Example from invoice creation
const number = await generateInvoiceNumber(); // INV-2025-0001
const newInvoice = await db.insert(invoices).values({
  id: crypto.randomUUID(),
  projectId,
  number, // Auto-generated
  // ... other fields
}).returning();

res.status(201).json({
  success: true,
  data: newInvoice[0],
  message: `Invoice ${number} created successfully`
});
```

---

## File Upload Specifications

**Citations**: `server/index.js:101-135`, File upload middleware configuration

### Upload Limits and Validation

```javascript
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10                    // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Basic file type validation
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### Thumbnail Generation

**Automatic Processing**: Images are automatically processed for thumbnails:
- **Resize**: Maximum 300x300 pixels
- **Format**: JPEG with 80% quality
- **Location**: `/uploads/thumbnails/` directory

---

## Authentication Notes

**Current State**: The API currently operates without authentication  
**Planned Implementation**: JWT-based authentication with role-based access control

### Future Security Model

```yaml
# Planned authentication structure
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT

# Role-based access patterns
roles:
  - Manager: Full CRUD access to all resources
  - Designer: Project-team limited access
  - Client: Read-only with approval/decision capabilities
```

---

## Questions / Integration Notes

1. **Authentication System**: JWT implementation planned but not yet implemented
2. **Rate Limiting**: Currently 1000 requests per 15 minutes globally
3. **Webhook Support**: No webhook capabilities for external integrations
4. **API Versioning**: No versioning strategy - breaking changes would affect all clients
5. **Pagination**: Large result sets not paginated (could impact performance)
6. **Caching**: No response caching implemented
7. **CORS Configuration**: Currently allows all origins in development
8. **Request Validation**: Limited server-side validation - relies on client validation

---

*Generated: Phase 3 of 6 - API Contract & OpenAPI Specification*  
*All endpoints verified from route file analysis*  
*All schemas based on actual database models and request/response patterns*