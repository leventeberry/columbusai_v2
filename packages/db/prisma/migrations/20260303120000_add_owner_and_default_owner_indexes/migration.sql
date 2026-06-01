-- CreateIndex
CREATE INDEX "clients_owner_user_id_idx" ON "automation"."clients"("owner_user_id");

-- CreateIndex
CREATE INDEX "task_templates_default_owner_user_id_idx" ON "automation"."task_templates"("default_owner_user_id");
