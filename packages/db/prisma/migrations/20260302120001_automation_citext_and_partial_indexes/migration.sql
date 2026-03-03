-- Enable CITEXT for case-insensitive email columns (run after add_automation_schema).
CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE "automation"."clients" ALTER COLUMN "primary_email" TYPE citext;
ALTER TABLE "automation"."users" ALTER COLUMN "email" TYPE citext;
ALTER TABLE "automation"."tasks" ALTER COLUMN "to_email" TYPE citext;

-- Partial / expression indexes (not expressible in Prisma schema).

-- clients: unique primary_email where not null
CREATE UNIQUE INDEX "clients_primary_email_unique_not_null"
  ON "automation"."clients"("primary_email") WHERE "primary_email" IS NOT NULL;

-- clients: partial index for needs_human_action
CREATE INDEX "clients_needs_human_action_idx"
  ON "automation"."clients"("needs_human_action") WHERE "needs_human_action" = true;

-- tasks: "due now" scheduler index
CREATE INDEX "tasks_due_now_idx"
  ON "automation"."tasks"("execute_at")
  WHERE "status" = 'queued' AND "automation_eligible" = true;
