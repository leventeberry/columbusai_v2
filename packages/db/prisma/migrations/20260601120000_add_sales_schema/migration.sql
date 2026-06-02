-- Sales pipeline schema (leads, opportunities, clients) — separate from automation.Client

CREATE SCHEMA IF NOT EXISTS "sales";

CREATE TYPE "sales"."SalesLeadStatus" AS ENUM ('new', 'qualified', 'disqualified', 'converted_to_opportunity');
CREATE TYPE "sales"."SalesLeadSource" AS ENUM ('demo_request', 'manual', 'import');
CREATE TYPE "sales"."SalesOpportunityStage" AS ENUM ('qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE "sales"."SalesClientStatus" AS ENUM ('onboarding', 'active', 'paused', 'churned');

CREATE TABLE "sales"."leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "team_size" TEXT NOT NULL DEFAULT '',
    "what_automate" TEXT NOT NULL,
    "budget" TEXT NOT NULL DEFAULT '',
    "timeline" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "status" "sales"."SalesLeadStatus" NOT NULL DEFAULT 'new',
    "source" "sales"."SalesLeadSource" NOT NULL DEFAULT 'demo_request',
    "notes" TEXT,
    "summary" TEXT,
    "priority" TEXT,
    "confidence" INTEGER,
    "recommended_next_step" TEXT,
    "analysis_raw" JSONB,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "leads_status_idx" ON "sales"."leads"("status");
CREATE INDEX "leads_email_idx" ON "sales"."leads"("email");
CREATE INDEX "leads_created_at_idx" ON "sales"."leads"("created_at" DESC);

CREATE TABLE "sales"."opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" UUID NOT NULL,
    "stage" "sales"."SalesOpportunityStage" NOT NULL DEFAULT 'qualified',
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "estimated_value" INTEGER,
    "close_date" DATE,
    "owner" TEXT,
    "notes" TEXT,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "opportunities_lead_id_key" ON "sales"."opportunities"("lead_id");
CREATE INDEX "opportunities_stage_idx" ON "sales"."opportunities"("stage");
CREATE INDEX "opportunities_created_at_idx" ON "sales"."opportunities"("created_at" DESC);

ALTER TABLE "sales"."opportunities" ADD CONSTRAINT "opportunities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "sales"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "sales"."clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunity_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "sales"."SalesClientStatus" NOT NULL DEFAULT 'onboarding',
    "owner" TEXT,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clients_opportunity_id_key" ON "sales"."clients"("opportunity_id");
CREATE INDEX "clients_status_idx" ON "sales"."clients"("status");
CREATE INDEX "clients_created_at_idx" ON "sales"."clients"("created_at" DESC);

ALTER TABLE "sales"."clients" ADD CONSTRAINT "clients_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "sales"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from legacy public.leads if present (runtime-created demo table)
INSERT INTO "sales"."leads" (
    "id",
    "created_at",
    "updated_at",
    "fname",
    "lname",
    "email",
    "phone",
    "company",
    "role",
    "industry",
    "team_size",
    "what_automate",
    "budget",
    "timeline",
    "website",
    "status",
    "source"
)
SELECT
    l."id",
    l."created_at",
    l."created_at",
    l."fname",
    l."lname",
    l."email",
    COALESCE(l."phone", ''),
    COALESCE(l."company", ''),
    COALESCE(l."role", ''),
    COALESCE(l."industry", ''),
    COALESCE(l."team_size", ''),
    l."what_automate",
    COALESCE(l."budget", ''),
    COALESCE(l."timeline", ''),
    COALESCE(l."website", ''),
    'new'::"sales"."SalesLeadStatus",
    'demo_request'::"sales"."SalesLeadSource"
FROM "public"."leads" AS l
WHERE NOT EXISTS (
    SELECT 1 FROM "sales"."leads" AS s WHERE s."id" = l."id"
)
ON CONFLICT ("id") DO NOTHING;
