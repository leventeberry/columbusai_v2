-- Sales client onboarding bridge to portal workspace

CREATE TYPE "sales"."SalesProvisioningStatus" AS ENUM ('pending', 'portal_ready', 'failed');

ALTER TABLE "sales"."clients"
  ADD COLUMN "portal_client_id" TEXT,
  ADD COLUMN "onboarding_work_item_id" TEXT,
  ADD COLUMN "stack_template_id" TEXT,
  ADD COLUMN "provisioning_status" "sales"."SalesProvisioningStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN "provisioning_error" TEXT;

CREATE UNIQUE INDEX "clients_portal_client_id_key" ON "sales"."clients"("portal_client_id");
