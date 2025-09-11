// FireLynx Database Schema with Drizzle ORM
// Project-centric data model with auto-numbering and file management

const crypto = require('crypto');
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  json,
  uuid,
  pgEnum,
  unique,
  index,
  foreignKey
} = require('drizzle-orm/pg-core');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // timeout for connection attempts
});

// Handle pool connection errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

const db = drizzle(pool);

// Using varchar for enum-like values instead of pgEnum for compatibility

// Core Tables
const clients = pgTable('clients', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }).notNull(),
  specialization: varchar('specialization', { length: 255 }),
  avatar: varchar('avatar', { length: 500 }),
  isOnline: boolean('is_online').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const projects = pgTable('projects', {
  id: varchar('id', { length: 50 }).primaryKey(),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id, { onDelete: 'restrict' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('Planning'),
  priority: varchar('priority', { length: 50 }).notNull().default('Medium'),
  budget: decimal('budget', { precision: 15, scale: 2 }),
  spent: decimal('spent', { precision: 15, scale: 2 }).default('0'),
  progress: integer('progress').default(0),
  startDate: timestamp('start_date'),
  targetDate: timestamp('target_date'),
  completedDate: timestamp('completed_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Performance indexes for frequently queried columns
  clientIdIdx: index('projects_client_id_idx').on(table.clientId),
  statusIdx: index('projects_status_idx').on(table.status),
  createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
}));

const projectTeam = pgTable('project_team', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  addedAt: timestamp('added_at').defaultNow()
}, (table) => ({
  // Unique constraint: one user can only have one role per project
  uniqueProjectUser: unique().on(table.projectId, table.userId),
  // Performance indexes
  projectIdIdx: index('project_team_project_id_idx').on(table.projectId),
  userIdIdx: index('project_team_user_id_idx').on(table.userId),
}));

const milestones = pgTable('milestones', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('Pending'),
  progress: integer('progress').default(0),
  expectedDate: timestamp('expected_date'),
  completedDate: timestamp('completed_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Performance indexes for project-scoped queries
  projectIdIdx: index('milestones_project_id_idx').on(table.projectId),
  statusIdx: index('milestones_status_idx').on(table.status),
  expectedDateIdx: index('milestones_expected_date_idx').on(table.expectedDate),
}));

const fileAssets = pgTable('file_assets', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  milestoneId: varchar('milestone_id', { length: 50 }).references(() => milestones.id, { onDelete: 'set null' }),
  ticketId: varchar('ticket_id', { length: 50 }),
  uploadedByUserId: varchar('uploaded_by_user_id', { length: 50 }).references(() => users.id, { onDelete: 'restrict' }).notNull(),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  previewUrl: varchar('preview_url', { length: 1000 }),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  visibility: varchar('visibility', { length: 50 }).notNull().default('Client'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  // Performance indexes for project-scoped file queries
  projectIdIdx: index('file_assets_project_id_idx').on(table.projectId),
  milestoneIdIdx: index('file_assets_milestone_id_idx').on(table.milestoneId),
  visibilityIdx: index('file_assets_visibility_idx').on(table.visibility),
  uploadedByIdx: index('file_assets_uploaded_by_idx').on(table.uploadedByUserId),
  createdAtIdx: index('file_assets_created_at_idx').on(table.createdAt),
}));

const milestoneFiles = pgTable('milestone_files', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id).notNull(),
  milestoneId: varchar('milestone_id', { length: 50 }).references(() => milestones.id).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 50 }).references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  storageUrl: varchar('storage_url', { length: 1000 }).notNull(),
  previewUrl: varchar('preview_url', { length: 1000 }),
  visibility: varchar('visibility', { length: 50 }).notNull().default('client'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, accepted, declined
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const invoices = pgTable('invoices', {
  id: varchar('id', { length: 50 }).primaryKey(),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  number: varchar('number', { length: 50 }).notNull().unique(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  lineItems: json('line_items').notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxTotal: decimal('tax_total', { precision: 15, scale: 2 }).notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('Draft'),
  sentAt: timestamp('sent_at'),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Performance indexes for project-scoped invoice queries
  projectIdIdx: index('invoices_project_id_idx').on(table.projectId),
  statusIdx: index('invoices_status_idx').on(table.status),
  numberIdx: index('invoices_number_idx').on(table.number),
  dueDateIdx: index('invoices_due_date_idx').on(table.dueDate),
  issueDateIdx: index('invoices_issue_date_idx').on(table.issueDate),
}));

const approvalPackets = pgTable('approval_packets', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id).notNull(),
  number: varchar('number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('Pending'),
  sentAt: timestamp('sent_at'),
  decidedAt: timestamp('decided_at'),
  clientComment: text('client_comment'),
  signatureName: varchar('signature_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const approvalItems = pgTable('approval_items', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  packetId: varchar('packet_id', { length: 50 }).references(() => approvalPackets.id).notNull(),
  fileAssetId: varchar('file_asset_id', { length: 50 }).references(() => fileAssets.id).notNull(),
  decision: varchar('decision', { length: 50 }).default('Pending'),
  comment: text('comment'),
  decidedAt: timestamp('decided_at')
});

const approvalFiles = pgTable('approval_files', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id).notNull(),
  approvalId: varchar('approval_id', { length: 50 }).references(() => approvalPackets.id).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 50 }).references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  storageUrl: varchar('storage_url', { length: 1000 }).notNull(),
  previewUrl: varchar('preview_url', { length: 1000 }),
  visibility: varchar('visibility', { length: 50 }).notNull().default('client'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, accepted, declined
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const variationRequests = pgTable('variation_requests', {
  id: varchar('id', { length: 50 }).primaryKey(),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  number: varchar('number', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  changeRequestor: varchar('change_requestor', { length: 255 }).notNull(),
  changeReference: varchar('change_reference', { length: 255 }),
  changeArea: varchar('change_area', { length: 255 }).notNull(),
  workTypes: json('work_types').notNull(), // Array of selected work types
  categories: json('categories').notNull(), // Array of selected categories
  changeDescription: text('change_description').notNull(),
  reasonDescription: text('reason_description').notNull(),
  technicalChanges: text('technical_changes'),
  resourcesAndCosts: text('resources_and_costs'),
  disposition: varchar('disposition', { length: 50 }),
  dispositionReason: text('disposition_reason'),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft → submitted → approved | declined
  attachments: json('attachments'), // Array of file asset IDs
  // Enhanced cost structure fields for Dubai projects
  materialCosts: json('material_costs'), // Array of {description, quantity, unitRate, total}
  laborCosts: json('labor_costs'), // Array of {description, hours, hourlyRate, total}
  additionalCosts: json('additional_costs'), // Array of {category, description, amount}
  currency: varchar('currency', { length: 10 }).default('AED'),
  title: varchar('title', { length: 255 }),
  priority: varchar('priority', { length: 50 }).default('medium'),
  priceImpact: decimal('price_impact', { precision: 10, scale: 2 }).default('0'),
  timeImpact: integer('time_impact').default(0), // days
  // Approval workflow fields
  submittedAt: timestamp('submitted_at'),
  decidedAt: timestamp('decided_at'),
  decidedBy: varchar('decided_by', { length: 50 }).references(() => users.id, { onDelete: 'set null' }),
  clientComment: text('client_comment'),
  invoiceId: varchar('invoice_id', { length: 50 }).references(() => invoices.id, { onDelete: 'set null' }), // Link to generated invoice
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Performance indexes for project-scoped variation queries
  projectIdIdx: index('variations_project_id_idx').on(table.projectId),
  statusIdx: index('variations_status_idx').on(table.status),
  numberIdx: index('variations_number_idx').on(table.number),
  priorityIdx: index('variations_priority_idx').on(table.priority),
  submittedAtIdx: index('variations_submitted_at_idx').on(table.submittedAt),
}));

const variationFiles = pgTable('variation_files', {
  id: varchar('id', { length: 50 }).primaryKey().$default(() => crypto.randomUUID()),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id).notNull(),
  variationId: varchar('variation_id', { length: 50 }).references(() => variationRequests.id).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 50 }).references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  storageUrl: varchar('storage_url', { length: 1000 }).notNull(),
  previewUrl: varchar('preview_url', { length: 1000 }),
  visibility: varchar('visibility', { length: 50 }).notNull().default('client'), // Only images/PDFs for client visibility
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, deleted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

const tickets = pgTable('tickets', {
  id: varchar('id', { length: 50 }).primaryKey(),
  projectId: varchar('project_id', { length: 50 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  number: varchar('number', { length: 50 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull().default('Medium'),
  status: varchar('status', { length: 50 }).notNull().default('Open'),
  assigneeUserId: varchar('assignee_user_id', { length: 50 }).references(() => users.id, { onDelete: 'set null' }),
  requesterUserId: varchar('requester_user_id', { length: 50 }).references(() => users.id, { onDelete: 'restrict' }).notNull(),
  attachments: json('attachments'), // Array of file asset IDs
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Performance indexes for project-scoped ticket queries
  projectIdIdx: index('tickets_project_id_idx').on(table.projectId),
  statusIdx: index('tickets_status_idx').on(table.status),
  priorityIdx: index('tickets_priority_idx').on(table.priority),
  categoryIdx: index('tickets_category_idx').on(table.category),
  assigneeIdx: index('tickets_assignee_idx').on(table.assigneeUserId),
  requesterIdx: index('tickets_requester_idx').on(table.requesterUserId),
  numberIdx: index('tickets_number_idx').on(table.number),
}));

const brandingSettings = pgTable('branding_settings', {
  id: varchar('id', { length: 50 }).primaryKey(),
  appName: varchar('app_name', { length: 100 }).notNull().default('FireLynx'),
  logoUrl: varchar('logo_url', { length: 500 }),
  accentColor: varchar('accent_color', { length: 7 }).notNull().default('#4C6FFF'),
  primaryTextColor: varchar('primary_text_color', { length: 7 }).notNull().default('#0F172A'),
  mutedTextColor: varchar('muted_text_color', { length: 7 }).notNull().default('#64748B'),
  borderColor: varchar('border_color', { length: 7 }).notNull().default('#E2E8F0'),
  bgSoft: varchar('bg_soft', { length: 7 }).notNull().default('#F8FAFC'),
  fontFamily: varchar('font_family', { length: 200 }).notNull().default('Inter, system-ui, Roboto, Helvetica, Arial'),
  footerLeft: varchar('footer_left', { length: 500 }).notNull().default('FireLynx Interior Design Studio'),
  footerRight: varchar('footer_right', { length: 500 }).notNull().default('support@firelynx.com • +1 (555) 123-4567'),
  watermarkEnabled: boolean('watermark_enabled').default(false),
  watermarkText: varchar('watermark_text', { length: 100 }).default('DRAFT'),
  watermarkOpacity: decimal('watermark_opacity', { precision: 3, scale: 2 }).default('0.08'),
  pageSize: varchar('page_size', { length: 10 }).default('A4'),
  pageMargins: varchar('page_margins', { length: 50 }).default('24mm 18mm 22mm 18mm'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto-numbering counters table
const documentCounters = pgTable('document_counters', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
  invoiceCounter: integer('invoice_counter').default(0),
  variationCounter: integer('variation_counter').default(0),
  approvalCounter: integer('approval_counter').default(0),
  ticketCounter: integer('ticket_counter').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Database initialization function
async function initializeDatabase() {
  try {
    // Test the connection by running a simple query
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    
    // Create tables (in production, use proper migrations)
    // This is simplified for development
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    console.log('⚠️  Continuing without database - using fallback data where available');
    // Don't throw error - let server start with mock data fallbacks
    return null;
  }
}

module.exports = {
  db,
  pool,
  initializeDatabase,
  // Export all tables for use in routes
  clients,
  users,
  projects,
  projectTeam,
  milestones,
  fileAssets,
  milestoneFiles,
  invoices,
  approvalPackets,
  approvalItems,
  approvalFiles,
  variationRequests,
  variationFiles,
  tickets,
  brandingSettings,
  documentCounters
};