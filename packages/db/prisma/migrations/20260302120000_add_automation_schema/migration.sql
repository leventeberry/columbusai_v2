-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "automation";

-- CreateEnum
CREATE TYPE "automation"."ClientSystemStage" AS ENUM ('new_lead', 'awaiting_response', 'discovery_scheduled', 'discovery_completed', 'no_show', 'proposal_sent', 'negotiation', 'setup_invoiced', 'awaiting_payment', 'setup_paid', 'closed_won', 'fulfilment', 'reactivation', 'on_hold', 'maintenance_active', 'delivered', 'live', 'churn_risk', 'churned', 'closed_lost', 'cancelled');

CREATE TYPE "automation"."ClientManualOverride" AS ENUM ('none', 'paused', 'on_hold');

CREATE TYPE "automation"."FollowupState" AS ENUM ('active', 'paused', 'completed');

CREATE TYPE "automation"."TaskStatus" AS ENUM ('queued', 'in_progress', 'waiting', 'done', 'failed', 'skipped', 'cancelled');

CREATE TYPE "automation"."TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE "automation"."TaskChannel" AS ENUM ('email', 'sms', 'phone', 'linkedin', 'internal', 'other');

CREATE TYPE "automation"."EventProcessingStatus" AS ENUM ('pending', 'processing', 'processed', 'failed', 'ignored');

CREATE TYPE "automation"."StageTransitionTriggeredBy" AS ENUM ('user_action', 'automation', 'scheduled', 'api', 'system', 'integration', 'manual_override');

CREATE TYPE "automation"."OutboundMessageDeliveryStatus" AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');

CREATE TYPE "automation"."InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void', 'uncollectible');

CREATE TYPE "automation"."PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateTable: users
CREATE TABLE "automation"."users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "display_name" TEXT,
    "role" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "automation"."users"("email");

-- CreateTable: clients
CREATE TABLE "automation"."clients" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "display_name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "primary_email" TEXT,
    "primary_phone" TEXT,
    "company_name" TEXT,
    "role" TEXT,
    "website" TEXT,
    "source" TEXT,
    "owner_user_id" TEXT,
    "priority" TEXT,
    "timeline" TEXT,
    "team_size" TEXT,
    "budget_band" TEXT,
    "system_stage" "automation"."ClientSystemStage" NOT NULL,
    "manual_override" "automation"."ClientManualOverride" NOT NULL DEFAULT 'none',
    "stage_updated_at" TIMESTAMPTZ(6),
    "lost_reason" TEXT,
    "discovery_cancelled_reason" TEXT,
    "discovery_cancelled_at" TIMESTAMPTZ(6),
    "followup_state" "automation"."FollowupState" NOT NULL DEFAULT 'active',
    "followup_sequence_key" TEXT,
    "followup_step" INTEGER NOT NULL DEFAULT 0,
    "next_followup_at" TIMESTAMPTZ(6),
    "sla_due_at" TIMESTAMPTZ(6),
    "needs_human_action" BOOLEAN NOT NULL DEFAULT false,
    "last_contact_at" TIMESTAMPTZ(6),
    "last_followup_type" TEXT,
    "followup_count" INTEGER NOT NULL DEFAULT 0,
    "followup_stop_reason" TEXT,
    "meeting_status" TEXT NOT NULL DEFAULT 'not_scheduled',
    "meeting_provider" TEXT,
    "meeting_link" TEXT,
    "meeting_external_id" TEXT,
    "meeting_start_at" TIMESTAMPTZ(6),
    "meeting_end_at" TIMESTAMPTZ(6),
    "proposed_setup_fee_cents" INTEGER,
    "invoice_status" TEXT NOT NULL DEFAULT 'not_sent',
    "stripe_customer_id" TEXT,
    "stripe_invoice_id" TEXT,
    "last_payment_at" TIMESTAMPTZ(6),
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribed_at" TIMESTAMPTZ(6),
    "automation_lock" BOOLEAN NOT NULL DEFAULT false,
    "notion_page_id" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "clients_system_stage_next_followup_at_idx" ON "automation"."clients"("system_stage", "next_followup_at");
CREATE INDEX "clients_meeting_external_id_idx" ON "automation"."clients"("meeting_external_id");
CREATE INDEX "clients_stripe_customer_id_idx" ON "automation"."clients"("stripe_customer_id");
CREATE INDEX "clients_stripe_invoice_id_idx" ON "automation"."clients"("stripe_invoice_id");

-- CreateTable: events_inbox
CREATE TABLE "automation"."events_inbox" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_lookup_key" TEXT,
    "client_id" TEXT,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMPTZ(6),
    "processing_status" "automation"."EventProcessingStatus" NOT NULL DEFAULT 'pending',
    "last_error" TEXT,

    CONSTRAINT "events_inbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "events_inbox_source_event_id_key" ON "automation"."events_inbox"("source", "event_id");
CREATE INDEX "events_inbox_processing_status_received_at_idx" ON "automation"."events_inbox"("processing_status", "received_at");
CREATE INDEX "events_inbox_client_id_occurred_at_idx" ON "automation"."events_inbox"("client_id", "occurred_at");

-- CreateTable: stage_transitions
CREATE TABLE "automation"."stage_transitions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "from_stage" TEXT,
    "to_stage" "automation"."ClientSystemStage" NOT NULL,
    "reason" TEXT,
    "triggered_by" "automation"."StageTransitionTriggeredBy" NOT NULL,
    "event_inbox_id" TEXT,
    "workflow_name" TEXT,
    "execution_id" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "stage_transitions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "stage_transitions_client_id_occurred_at_idx" ON "automation"."stage_transitions"("client_id", "occurred_at" DESC);
CREATE INDEX "stage_transitions_to_stage_occurred_at_idx" ON "automation"."stage_transitions"("to_stage", "occurred_at" DESC);

-- CreateTable: task_templates
CREATE TABLE "automation"."task_templates" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_stage" TEXT,
    "stage_trigger_type" TEXT NOT NULL,
    "trigger_event_type" TEXT,
    "offset_type" TEXT NOT NULL,
    "offset_value" INTEGER NOT NULL DEFAULT 0,
    "offset_unit" TEXT NOT NULL DEFAULT 'days',
    "recurrence_rrule" TEXT,
    "task_key" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assign_to" TEXT NOT NULL DEFAULT 'auto',
    "default_owner_user_id" TEXT,
    "automation_eligible" BOOLEAN NOT NULL DEFAULT true,
    "cancel_if_stage_changes" BOOLEAN NOT NULL DEFAULT true,
    "prevent_duplicate" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "channel" TEXT NOT NULL,
    "subject_template" TEXT,
    "message_template" TEXT,
    "booking_link_template" TEXT,
    "require_fields" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_templates_task_key_key" ON "automation"."task_templates"("task_key");
CREATE INDEX "task_templates_is_active_trigger_stage_stage_trigger_type_idx" ON "automation"."task_templates"("is_active", "trigger_stage", "stage_trigger_type");

-- CreateTable: tasks
CREATE TABLE "automation"."tasks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "template_id" TEXT,
    "task_key" TEXT NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "source_event_inbox_id" TEXT,
    "status" "automation"."TaskStatus" NOT NULL DEFAULT 'queued',
    "priority" "automation"."TaskPriority" NOT NULL DEFAULT 'medium',
    "needs_human_action" BOOLEAN NOT NULL DEFAULT false,
    "automation_eligible" BOOLEAN NOT NULL DEFAULT true,
    "manual_override" TEXT NOT NULL DEFAULT 'none',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "execute_at" TIMESTAMPTZ(6) NOT NULL,
    "due_at" TIMESTAMPTZ(6),
    "sla_due_at" TIMESTAMPTZ(6),
    "channel" "automation"."TaskChannel" NOT NULL,
    "to_email" TEXT,
    "to_phone" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "booking_link" TEXT,
    "locked_until" TIMESTAMPTZ(6),
    "locked_by" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMPTZ(6),
    "last_error" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "outcome" TEXT,
    "outcome_notes" TEXT,
    "metadata" JSONB,
    "notion_page_id" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tasks_dedupe_key_key" ON "automation"."tasks"("dedupe_key");
CREATE INDEX "tasks_status_automation_eligible_execute_at_idx" ON "automation"."tasks"("status", "automation_eligible", "execute_at");
CREATE INDEX "tasks_locked_until_idx" ON "automation"."tasks"("locked_until");
CREATE INDEX "tasks_client_id_status_idx" ON "automation"."tasks"("client_id", "status");

-- CreateTable: task_attempts
CREATE TABLE "automation"."task_attempts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "task_id" TEXT NOT NULL,
    "attempt_no" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "execution_id" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "result" JSONB,

    CONSTRAINT "task_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_attempts_task_id_attempt_no_idx" ON "automation"."task_attempts"("task_id", "attempt_no" DESC);

-- CreateTable: outbound_messages
CREATE TABLE "automation"."outbound_messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT,
    "task_id" TEXT,
    "channel" TEXT NOT NULL,
    "provider" TEXT,
    "provider_message_id" TEXT,
    "to_address" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_status" "automation"."OutboundMessageDeliveryStatus",
    "delivered_at" TIMESTAMPTZ(6),
    "bounced_at" TIMESTAMPTZ(6),
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "outbound_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outbound_messages_provider_message_id_idx" ON "automation"."outbound_messages"("provider_message_id");
CREATE INDEX "outbound_messages_client_id_sent_at_idx" ON "automation"."outbound_messages"("client_id", "sent_at" DESC);

-- CreateTable: meetings
CREATE TABLE "automation"."meetings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_at" TIMESTAMPTZ(6),
    "end_at" TIMESTAMPTZ(6),
    "meeting_link" TEXT,
    "raw_payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meetings_provider_external_id_key" ON "automation"."meetings"("provider", "external_id");

-- CreateTable: invoices
CREATE TABLE "automation"."invoices" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "external_invoice_id" TEXT NOT NULL,
    "status" "automation"."InvoiceStatus" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "invoice_url" TEXT,
    "due_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "raw_payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoices_provider_external_invoice_id_key" ON "automation"."invoices"("provider", "external_invoice_id");

-- CreateTable: payments
CREATE TABLE "automation"."payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "external_payment_id" TEXT NOT NULL,
    "status" "automation"."PaymentStatus" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "paid_at" TIMESTAMPTZ(6),
    "raw_payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_provider_external_payment_id_key" ON "automation"."payments"("provider", "external_payment_id");

-- CreateTable: client_identities
CREATE TABLE "automation"."client_identities" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_identities_kind_value_key" ON "automation"."client_identities"("kind", "value");
CREATE INDEX "client_identities_client_id_kind_idx" ON "automation"."client_identities"("client_id", "kind");

-- CreateTable: automation_locks
CREATE TABLE "automation"."automation_locks" (
    "lock_key" TEXT NOT NULL,
    "locked_until" TIMESTAMPTZ(6) NOT NULL,
    "locked_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_locks_pkey" PRIMARY KEY ("lock_key")
);

-- AddForeignKey
ALTER TABLE "automation"."clients" ADD CONSTRAINT "clients_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "automation"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."events_inbox" ADD CONSTRAINT "events_inbox_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."stage_transitions" ADD CONSTRAINT "stage_transitions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation"."stage_transitions" ADD CONSTRAINT "stage_transitions_event_inbox_id_fkey" FOREIGN KEY ("event_inbox_id") REFERENCES "automation"."events_inbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."task_templates" ADD CONSTRAINT "task_templates_default_owner_user_id_fkey" FOREIGN KEY ("default_owner_user_id") REFERENCES "automation"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation"."tasks" ADD CONSTRAINT "tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "automation"."task_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."tasks" ADD CONSTRAINT "tasks_source_event_inbox_id_fkey" FOREIGN KEY ("source_event_inbox_id") REFERENCES "automation"."events_inbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."task_attempts" ADD CONSTRAINT "task_attempts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "automation"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "automation"."outbound_messages" ADD CONSTRAINT "outbound_messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."outbound_messages" ADD CONSTRAINT "outbound_messages_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "automation"."tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."meetings" ADD CONSTRAINT "meetings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation"."invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation"."payments" ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "automation"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "automation"."client_identities" ADD CONSTRAINT "client_identities_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "automation"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
