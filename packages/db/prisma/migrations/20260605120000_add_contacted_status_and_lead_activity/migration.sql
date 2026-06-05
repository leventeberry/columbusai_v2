-- AlterEnum
ALTER TYPE "sales"."SalesLeadStatus" ADD VALUE 'contacted' BEFORE 'qualified';

-- CreateTable
CREATE TABLE "sales"."lead_activity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "metadata" JSONB,

    CONSTRAINT "lead_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_activity_lead_id_created_at_idx" ON "sales"."lead_activity"("lead_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "lead_activity_created_at_idx" ON "sales"."lead_activity"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "sales"."lead_activity" ADD CONSTRAINT "lead_activity_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "sales"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
