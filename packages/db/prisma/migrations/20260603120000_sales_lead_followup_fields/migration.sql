-- Add follow-up tracking columns to sales.leads for scheduled n8n poll workflow.

ALTER TABLE "sales"."leads"
  ADD COLUMN "followup_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "last_followup_at" TIMESTAMPTZ(6),
  ADD COLUMN "next_followup_at" TIMESTAMPTZ(6);

CREATE INDEX "leads_status_next_followup_at_idx"
  ON "sales"."leads"("status", "next_followup_at");

CREATE INDEX "leads_due_followup_idx"
  ON "sales"."leads"("next_followup_at")
  WHERE "status" = 'new' AND "followup_count" < 2;

-- Backfill: schedule first follow-up for existing open demo leads (24h default).
UPDATE "sales"."leads"
SET "next_followup_at" = "created_at" + INTERVAL '1440 minutes'
WHERE "status" = 'new'
  AND "source" = 'demo_request'
  AND "followup_count" = 0
  AND "next_followup_at" IS NULL;
