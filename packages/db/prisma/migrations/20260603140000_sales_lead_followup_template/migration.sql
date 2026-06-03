-- Add optional follow-up template id for multi-touch registry workflows (NULL = legacy Columbus flow).
ALTER TABLE "sales"."leads"
  ADD COLUMN IF NOT EXISTS "followup_template" TEXT;

CREATE INDEX IF NOT EXISTS "leads_followup_template_status_next_followup_at_idx"
  ON "sales"."leads" ("followup_template", "status", "next_followup_at");
