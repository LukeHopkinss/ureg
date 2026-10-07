CREATE TYPE "public"."automation_status" AS ENUM('HEALTHY', 'MISSED', 'MISSING', 'STALE', 'UNREGISTERED', 'FAILING', 'REMOVED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."desired_state" AS ENUM('declared', 'not_declared', 'removed');--> statement-breakpoint
CREATE TYPE "public"."execution_status" AS ENUM('started', 'success', 'failed', 'cancelled', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."managed_by" AS ENUM('config', 'dashboard', 'integration');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."observed_state" AS ENUM('observed', 'not_observed', 'unverifiable');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('config', 'manual', 'github_actions', 'python_sdk', 'cli');--> statement-breakpoint
CREATE TYPE "public"."status_reason" AS ENUM('EXECUTION_CURRENT', 'MISSED_EXPECTED_EXECUTION', 'SOURCE_NOT_OBSERVED', 'DISCOVERED_NOT_DECLARED', 'SDK_LEASE_EXPIRED', 'RECENT_EXECUTION_FAILED', 'INTENTIONALLY_REMOVED', 'INSUFFICIENT_EVIDENCE');--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "automation_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"automation_id" uuid NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_external_id" text,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exists" boolean NOT NULL,
	"metadata_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stable_key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"business_notes" text,
	"owner_type" text,
	"owner_value" text,
	"environment" text,
	"source_type" "source_type" NOT NULL,
	"source_external_id" text,
	"schedule_type" text,
	"schedule_expression" text,
	"schedule_human" text,
	"grace_intervals" integer DEFAULT 2 NOT NULL,
	"desired_state" "desired_state" NOT NULL,
	"observed_state" "observed_state" DEFAULT 'unverifiable' NOT NULL,
	"status" "automation_status" DEFAULT 'UNKNOWN' NOT NULL,
	"status_reason" "status_reason" DEFAULT 'INSUFFICIENT_EVIDENCE' NOT NULL,
	"last_seen_at" timestamp with time zone,
	"last_run_at" timestamp with time zone,
	"next_expected_run_at" timestamp with time zone,
	"last_evaluated_at" timestamp with time zone,
	"managed_by" "managed_by" NOT NULL,
	"management_source_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"automation_id" uuid NOT NULL,
	"external_execution_id" text,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" "execution_status" DEFAULT 'started' NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_account_id" text,
	"encrypted_credentials" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integration_sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_connection_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"records_discovered" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_observations" ADD CONSTRAINT "automation_observations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_observations" ADD CONSTRAINT "automation_observations_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_runs" ADD CONSTRAINT "integration_sync_runs_integration_connection_id_integration_connections_id_fk" FOREIGN KEY ("integration_connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automation_observations_automation_idx" ON "automation_observations" USING btree ("automation_id","observed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "automations_org_stable_key_uq" ON "automations" USING btree ("organization_id","stable_key");--> statement-breakpoint
CREATE INDEX "automations_org_idx" ON "automations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automations_org_status_idx" ON "automations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "automations_org_last_run_idx" ON "automations" USING btree ("organization_id","last_run_at");--> statement-breakpoint
CREATE UNIQUE INDEX "executions_automation_external_id_uq" ON "executions" USING btree ("automation_id","external_execution_id");--> statement-breakpoint
CREATE INDEX "executions_automation_started_idx" ON "executions" USING btree ("automation_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "executions_org_started_idx" ON "executions" USING btree ("organization_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "integration_connections_org_provider_idx" ON "integration_connections" USING btree ("organization_id","provider");