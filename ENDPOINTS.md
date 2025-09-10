# FireLynx API Endpoints Reference

Complete index of all API endpoints in the FireLynx system.

## Diagnostic Endpoints

### System Health & Information
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/__version` | Build and version information | None |
| `GET` | `/__routes` | Complete route listing | None |
| `GET` | `/__healthz` | Health check status | None |
| `GET` | `/__diagnostics` | API diagnostics data | None |

## Core Business Endpoints

### Projects Management
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/projects` | Get all projects | - |
| `GET` | `/api/projects/:id` | Get single project | `id`: Project ID |
| `POST` | `/api/projects` | Create new project | Body: project data |
| `PUT` | `/api/projects/:id` | Update project | `id`: Project ID, Body: updates |
| `DELETE` | `/api/projects/:id` | Delete project | `id`: Project ID |

### Team Management
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/team/users` | Get all system users | - |
| `GET` | `/api/team` | Get team members | Query: `projectId` (required) |
| `GET` | `/api/team/project/:projectId` | Get project team | `projectId`: Project ID |
| `POST` | `/api/team` | Add team member | Body: `projectId`, `userId`, `role` |
| `DELETE` | `/api/team/:teamMemberId` | Remove team member | `teamMemberId`: Team member ID |
| `DELETE` | `/api/team/project/:projectId/user/:userId` | Remove user from project | `projectId`, `userId` |
| `PUT` | `/api/team/:teamMemberId/role` | Update member role | `teamMemberId`, Body: `role` |
| `GET` | `/api/team/available-users/:projectId` | Get available users | `projectId`: Project ID |

### Milestones
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/milestones` | Get all milestones | Query: `projectId` |
| `GET` | `/api/milestones/project/:projectId` | Get project milestones | `projectId`: Project ID |
| `POST` | `/api/milestones` | Create milestone | Body: milestone data |
| `PUT` | `/api/milestones/:id` | Update milestone | `id`: Milestone ID, Body: updates |
| `DELETE` | `/api/milestones/:id` | Delete milestone | `id`: Milestone ID |
| `GET` | `/api/milestones/:mid/files` | Get milestone files | `mid`: Milestone ID |
| `POST` | `/api/milestones/:mid/files` | Upload files to milestone | `mid`: Milestone ID, Files: multipart |
| `PUT` | `/api/milestones/:mid/files/:fileId/status` | Update file status | `mid`, `fileId`, Body: `status` |
| `POST` | `/api/milestones/:id/upload` | Upload to milestone | `id`: Milestone ID, Files: multipart |

### Milestone Files (Dedicated)
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/milestone-files/:milestoneId` | Get files for milestone | `milestoneId`, Query: `visibility` |
| `POST` | `/api/milestone-files/upload` | Upload milestone files | Body: `projectId`, `milestoneId`, `uploadedBy`, `visibility` |
| `DELETE` | `/api/milestone-files/:id` | Delete milestone file | `id`: File ID |
| `GET` | `/api/milestone-files/project/:projectId` | Get project milestone files | `projectId`, Query: `visibility` |
| `PUT` | `/api/milestone-files/:id/status` | Update file status | `id`: File ID, Body: `status` |

### General Files
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/files/project/:projectId` | Get project files | `projectId`: Project ID |
| `GET` | `/api/files/milestone/:milestoneId` | Get milestone files | `milestoneId`: Milestone ID |
| `POST` | `/api/files/upload` | Upload files | Body: file data, Files: multipart |
| `PUT` | `/api/files/:fileId/visibility` | Update file visibility | `fileId`, Body: `visibility` |
| `DELETE` | `/api/files/:fileId` | Delete file | `fileId`: File ID |
| `GET` | `/api/files/:fileId/download` | Download file | `fileId`: File ID |
| `GET` | `/api/files/stats/:projectId` | Get file statistics | `projectId`: Project ID |

### Invoices
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/invoices` | Get all invoices | - |
| `GET` | `/api/invoices/project/:projectId` | Get project invoices | `projectId`: Project ID |
| `POST` | `/api/invoices` | Create invoice | Body: invoice data |
| `PUT` | `/api/invoices/:id` | Update invoice | `id`: Invoice ID, Body: updates |
| `DELETE` | `/api/invoices/:id` | Delete invoice | `id`: Invoice ID |
| `POST` | `/api/invoices/:id/send` | Send invoice to client | `id`: Invoice ID |
| `POST` | `/api/invoices/:id/payment` | Record payment | `id`: Invoice ID, Body: payment data |

### Variation Requests
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/variations` | Get all variations | - |
| `GET` | `/api/variations/project/:projectId` | Get project variations | `projectId`: Project ID |
| `GET` | `/api/variations/:id` | Get single variation | `id`: Variation ID |
| `POST` | `/api/variations` | Create variation | Body: variation data |
| `PUT` | `/api/variations/:id` | Update variation | `id`: Variation ID, Body: updates |
| `DELETE` | `/api/variations/:id` | Delete variation | `id`: Variation ID |
| `GET` | `/api/variations/options` | Get work types/categories | - |
| `POST` | `/api/variations/:id/disposition` | Manager disposition | `id`: Variation ID, Body: disposition |
| `POST` | `/api/variations/:id/submit` | Submit for approval | `id`: Variation ID |
| `POST` | `/api/variations/:id/approve` | Client approve | `id`: Variation ID |
| `POST` | `/api/variations/:id/decline` | Client decline | `id`: Variation ID, Body: reason |

### Variation Files
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `POST` | `/api/variations/:variationId/files` | Upload variation files | `variationId`, Files: multipart |
| `GET` | `/api/variations/:variationId/files` | Get variation files | `variationId`: Variation ID |
| `DELETE` | `/api/variations/:variationId/files/:fileId` | Delete variation file | `variationId`, `fileId` |

### Approval Packets
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/approvals/project/:projectId` | Get project approvals | `projectId`: Project ID |
| `POST` | `/api/approvals` | Create approval packet | Body: approval data |
| `DELETE` | `/api/approvals/:id` | Delete approval | `id`: Approval ID |
| `POST` | `/api/approvals/:id/send` | Send for client approval | `id`: Approval ID |
| `POST` | `/api/approvals/:id/decision` | Record client decision | `id`: Approval ID, Body: decision |

### Support Tickets
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/tickets` | Get all tickets | - |
| `GET` | `/api/tickets/project/:projectId` | Get project tickets | `projectId`: Project ID |
| `POST` | `/api/tickets` | Create ticket | Body: ticket data |
| `PUT` | `/api/tickets/:id` | Update ticket | `id`: Ticket ID, Body: updates |
| `DELETE` | `/api/tickets/:id` | Delete ticket | `id`: Ticket ID |
| `POST` | `/api/tickets/:id/assign` | Assign ticket | `id`: Ticket ID, Body: `assigneeUserId` |
| `POST` | `/api/tickets/:id/status` | Update ticket status | `id`: Ticket ID, Body: `status` |
| `POST` | `/api/tickets/:id/attachments` | Add attachments | `id`: Ticket ID, Files: multipart |
| `GET` | `/api/tickets/categories` | Get ticket categories | - |

## PDF Generation

### Modern HTML-Based PDF Generation
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/pdf/invoice/:invoiceId/preview` | Invoice PDF preview | `invoiceId`: Invoice ID |
| `GET` | `/api/pdf/invoice/:invoiceId` | Generate invoice PDF | `invoiceId`: Invoice ID |
| `GET` | `/api/pdf/variation/:variationId/preview` | Variation PDF preview | `variationId`: Variation ID |
| `GET` | `/api/pdf/variation/:variationId` | Generate variation PDF | `variationId`: Variation ID |
| `GET` | `/api/pdf/projects/:projectId/invoices/:invoiceId` | Project invoice PDF | `projectId`, `invoiceId` |
| `GET` | `/api/pdf/projects/:projectId/variations/:variationId` | Project variation PDF | `projectId`, `variationId` |

### Client Portal PDF Access
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/pdf/client/invoice/:invoiceId` | Client invoice PDF | `invoiceId`: Invoice ID |
| `GET` | `/api/pdf/client/variation/:variationId` | Client variation PDF | `variationId`: Variation ID |
| `GET` | `/api/pdf/client/project/:projectId/documents` | Client project documents | `projectId`: Project ID |

### Legacy PDFKit Generation
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `POST` | `/api/pdf-legacy/invoice/:invoiceId` | Legacy invoice PDF | `invoiceId`: Invoice ID |
| `POST` | `/api/pdf-legacy/variation/:variationId` | Legacy variation PDF | `variationId`: Variation ID |
| `POST` | `/api/pdf-legacy/approval/:approvalId` | Legacy approval PDF | `approvalId`: Approval ID |

## Branding & Customization

### Branding Settings
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/branding` | Get branding settings | - |
| `PUT` | `/api/branding` | Update branding | Body: branding settings |
| `POST` | `/api/branding/logo` | Upload logo | Files: logo file |
| `DELETE` | `/api/branding/logo` | Delete logo | - |
| `GET` | `/api/branding/preview` | Preview branding | - |

## Administrative

### Admin Operations
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/admin/seed-demo` | Seed demonstration data | - |

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": {...},
  "count": 10,
  "message": "Operation completed"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Authentication Notes

- **Development Environment**: All endpoints currently accessible without authentication
- **Role-Based Access**: Prepared for user role and project team role restrictions
- **Client Portal**: Endpoints with `/client/` paths designed for client-specific access
- **Manager Portal**: Full API access for internal team members

## File Upload Specifications

### Supported Upload Endpoints
- `/api/files/upload` - General file uploads
- `/api/milestone-files/upload` - Milestone-specific files
- `/api/milestones/:id/files` - Milestone file attachments
- `/api/variations/:id/files` - Variation request attachments
- `/api/tickets/:id/attachments` - Ticket attachments
- `/api/branding/logo` - Logo uploads

### Upload Configuration
- **Max Files**: 10 files per request (where applicable)
- **File Types**: Images, PDFs, documents, CAD files
- **Processing**: Automatic thumbnail generation for images
- **Storage**: Organized filesystem with `/uploads/`, `/thumbnails/`, `/previews/`

## Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | Success | Successful GET, PUT operations |
| `201` | Created | Successful POST operations |
| `400` | Bad Request | Invalid parameters or missing required fields |
| `404` | Not Found | Resource not found |
| `500` | Server Error | Internal server error |

## Query Parameters

### Common Query Parameters
- `projectId` - Filter by project (required for most endpoints)
- `visibility` - Filter by visibility (`client`, `internal`)
- `status` - Filter by status (varies by entity)
- `include` - Include related data or specific statuses

---

*Last Updated: September 10, 2025*  
*API Version: 1.0.0*
*Total Endpoints: 70+*