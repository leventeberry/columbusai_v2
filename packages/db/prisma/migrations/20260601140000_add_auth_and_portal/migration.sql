-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";
CREATE SCHEMA IF NOT EXISTS "portal";

-- CreateEnum
CREATE TYPE "auth"."AppUserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'VIEWER', 'CLIENT');
CREATE TYPE "auth"."AppUserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');
CREATE TYPE "auth"."ClientSource" AS ENUM ('PORTAL', 'SALES', 'AUTOMATION');
CREATE TYPE "auth"."PortalClientRole" AS ENUM ('OWNER', 'ADMIN', 'VIEWER');

CREATE TYPE "portal"."PortalWorkType" AS ENUM ('website', 'automation', 'integration', 'support', 'deployment', 'bug', 'internal', 'billing', 'onboarding');
CREATE TYPE "portal"."PortalWorkStatus" AS ENUM ('requested', 'in_review', 'planned', 'in_progress', 'waiting_on_client', 'testing', 'completed', 'cancelled');
CREATE TYPE "portal"."PortalWorkPriority" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "portal"."PortalCommentVisibility" AS ENUM ('public', 'internal');
CREATE TYPE "portal"."PortalActivityKind" AS ENUM ('created', 'status_changed', 'assignee_changed', 'priority_changed', 'watcher_added', 'watcher_removed', 'comment_added', 'attachment_added', 'attachment_removed', 'archived', 'completed');

-- CreateTable auth.users
CREATE TABLE "auth"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "auth"."AppUserRole" NOT NULL DEFAULT 'STAFF',
    "status" "auth"."AppUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "display_name" TEXT,
    "avatar_url" TEXT,
    "job_title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateTable auth.sessions
CREATE TABLE "auth"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sessions_token_hash_key" ON "auth"."sessions"("token_hash");
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions"("user_id");
CREATE INDEX "sessions_expires_at_idx" ON "auth"."sessions"("expires_at");

ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable auth.client_users
CREATE TABLE "auth"."client_users" (
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_source" "auth"."ClientSource" NOT NULL DEFAULT 'PORTAL',
    "role" "auth"."PortalClientRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_users_pkey" PRIMARY KEY ("user_id","client_id","client_source")
);

CREATE INDEX "client_users_client_id_client_source_idx" ON "auth"."client_users"("client_id", "client_source");

ALTER TABLE "auth"."client_users" ADD CONSTRAINT "client_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable auth.password_reset_tokens
CREATE TABLE "auth"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "auth"."password_reset_tokens"("token_hash");
CREATE INDEX "password_reset_tokens_user_id_idx" ON "auth"."password_reset_tokens"("user_id");

ALTER TABLE "auth"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable auth.audit_events
CREATE TABLE "auth"."audit_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_events_actor_user_id_idx" ON "auth"."audit_events"("actor_user_id");
CREATE INDEX "audit_events_created_at_idx" ON "auth"."audit_events"("created_at");

ALTER TABLE "auth"."audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable portal.clients
CREATE TABLE "portal"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable portal.work_items
CREATE TABLE "portal"."work_items" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "portal"."PortalWorkType" NOT NULL,
    "status" "portal"."PortalWorkStatus" NOT NULL DEFAULT 'requested',
    "priority" "portal"."PortalWorkPriority" NOT NULL DEFAULT 'medium',
    "created_by_user_id" TEXT NOT NULL,
    "primary_assignee_id" TEXT,
    "assignee_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "watcher_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "due_date" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_items_client_id_idx" ON "portal"."work_items"("client_id");
CREATE INDEX "work_items_status_idx" ON "portal"."work_items"("status");

ALTER TABLE "portal"."work_items" ADD CONSTRAINT "work_items_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "portal"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable portal.work_comments
CREATE TABLE "portal"."work_comments" (
    "id" TEXT NOT NULL,
    "work_item_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibility" "portal"."PortalCommentVisibility" NOT NULL DEFAULT 'public',
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_comments_work_item_id_idx" ON "portal"."work_comments"("work_item_id");

ALTER TABLE "portal"."work_comments" ADD CONSTRAINT "work_comments_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "portal"."work_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable portal.work_attachments
CREATE TABLE "portal"."work_attachments" (
    "id" TEXT NOT NULL,
    "work_item_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "mime" TEXT,
    "url" TEXT NOT NULL DEFAULT '#',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_attachments_work_item_id_idx" ON "portal"."work_attachments"("work_item_id");

ALTER TABLE "portal"."work_attachments" ADD CONSTRAINT "work_attachments_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "portal"."work_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable portal.work_activity
CREATE TABLE "portal"."work_activity" (
    "id" TEXT NOT NULL,
    "work_item_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "kind" "portal"."PortalActivityKind" NOT NULL,
    "from_value" TEXT,
    "to_value" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_activity_work_item_id_idx" ON "portal"."work_activity"("work_item_id");

ALTER TABLE "portal"."work_activity" ADD CONSTRAINT "work_activity_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "portal"."work_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable portal.notifications
CREATE TABLE "portal"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_idx" ON "portal"."notifications"("user_id");
