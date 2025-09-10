CREATE TABLE "clients" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"company" varchar(255),
	"address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"role" varchar(50) NOT NULL,
	"specialization" varchar(255),
	"avatar" varchar(500),
	"is_online" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"client_id" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'Planning' NOT NULL,
	"priority" varchar(50) DEFAULT 'Medium' NOT NULL,
	"budget" numeric(15, 2),
	"spent" numeric(15, 2) DEFAULT '0',
	"progress" integer DEFAULT 0,
	"start_date" timestamp,
	"target_date" timestamp,
	"completed_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_team" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"role" varchar(100) NOT NULL,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"expected_date" timestamp,
	"completed_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_assets" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"milestone_id" varchar(50),
	"ticket_id" varchar(50),
	"uploaded_by_user_id" varchar(50) NOT NULL,
	"filename" varchar(500) NOT NULL,
	"original_name" varchar(500) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"visibility" varchar(50) DEFAULT 'Client' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestone_files" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"milestone_id" varchar(50) NOT NULL,
	"uploaded_by" varchar(50) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"storage_url" varchar(1000) NOT NULL,
	"preview_url" varchar(1000),
	"visibility" varchar(50) DEFAULT 'client' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"number" varchar(50) NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"line_items" json NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_total" numeric(15, 2) NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "approval_packets" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"number" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"sent_at" timestamp,
	"decided_at" timestamp,
	"client_comment" text,
	"signature_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "approval_packets_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "approval_items" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"packet_id" varchar(50) NOT NULL,
	"file_asset_id" varchar(50) NOT NULL,
	"decision" varchar(50) DEFAULT 'Pending',
	"comment" text,
	"decided_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "variation_requests" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"number" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"change_requestor" varchar(255) NOT NULL,
	"change_reference" varchar(255),
	"change_area" varchar(255) NOT NULL,
	"work_types" json NOT NULL,
	"categories" json NOT NULL,
	"change_description" text NOT NULL,
	"reason_description" text NOT NULL,
	"technical_changes" text,
	"resources_and_costs" text,
	"disposition" varchar(50),
	"disposition_reason" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"attachments" json,
	"material_costs" json,
	"labor_costs" json,
	"additional_costs" json,
	"currency" varchar(10) DEFAULT 'AED',
	"title" varchar(255),
	"priority" varchar(50) DEFAULT 'medium',
	"price_impact" numeric(10, 2) DEFAULT '0',
	"time_impact" integer DEFAULT 0,
	"submitted_at" timestamp,
	"decided_at" timestamp,
	"decided_by" varchar(50),
	"client_comment" text,
	"invoice_id" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "variation_requests_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "variation_files" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"variation_id" varchar(50) NOT NULL,
	"uploaded_by" varchar(50) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"storage_url" varchar(1000) NOT NULL,
	"preview_url" varchar(1000),
	"visibility" varchar(50) DEFAULT 'client' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"number" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"priority" varchar(50) DEFAULT 'Medium' NOT NULL,
	"status" varchar(50) DEFAULT 'Open' NOT NULL,
	"assignee_user_id" varchar(50),
	"requester_user_id" varchar(50) NOT NULL,
	"attachments" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tickets_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"app_name" varchar(100) DEFAULT 'FireLynx' NOT NULL,
	"logo_url" varchar(500),
	"accent_color" varchar(7) DEFAULT '#4C6FFF' NOT NULL,
	"primary_text_color" varchar(7) DEFAULT '#0F172A' NOT NULL,
	"muted_text_color" varchar(7) DEFAULT '#64748B' NOT NULL,
	"border_color" varchar(7) DEFAULT '#E2E8F0' NOT NULL,
	"bg_soft" varchar(7) DEFAULT '#F8FAFC' NOT NULL,
	"font_family" varchar(200) DEFAULT 'Inter, system-ui, Roboto, Helvetica, Arial' NOT NULL,
	"footer_left" varchar(500) DEFAULT 'FireLynx Interior Design Studio' NOT NULL,
	"footer_right" varchar(500) DEFAULT 'support@firelynx.com • +1 (555) 123-4567' NOT NULL,
	"watermark_enabled" boolean DEFAULT false,
	"watermark_text" varchar(100) DEFAULT 'DRAFT',
	"watermark_opacity" numeric(3, 2) DEFAULT '0.08',
	"page_size" varchar(10) DEFAULT 'A4',
	"page_margins" varchar(50) DEFAULT '24mm 18mm 22mm 18mm',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"invoice_counter" integer DEFAULT 0,
	"variation_counter" integer DEFAULT 0,
	"approval_counter" integer DEFAULT 0,
	"ticket_counter" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team" ADD CONSTRAINT "project_team_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team" ADD CONSTRAINT "project_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_files" ADD CONSTRAINT "milestone_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_files" ADD CONSTRAINT "milestone_files_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_files" ADD CONSTRAINT "milestone_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_packets" ADD CONSTRAINT "approval_packets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_items" ADD CONSTRAINT "approval_items_packet_id_approval_packets_id_fk" FOREIGN KEY ("packet_id") REFERENCES "public"."approval_packets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_items" ADD CONSTRAINT "approval_items_file_asset_id_file_assets_id_fk" FOREIGN KEY ("file_asset_id") REFERENCES "public"."file_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_requests" ADD CONSTRAINT "variation_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_requests" ADD CONSTRAINT "variation_requests_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_requests" ADD CONSTRAINT "variation_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_files" ADD CONSTRAINT "variation_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_files" ADD CONSTRAINT "variation_files_variation_id_variation_requests_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."variation_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variation_files" ADD CONSTRAINT "variation_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_user_id_users_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_requester_user_id_users_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;