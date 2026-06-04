-- Bind chat conversations to widget tokens or authenticated users.

CREATE TYPE "chat"."ConversationPrincipalType" AS ENUM ('widget', 'user');

ALTER TABLE "chat"."conversations"
  ADD COLUMN "owner_user_id" TEXT,
  ADD COLUMN "principal_type" "chat"."ConversationPrincipalType" NOT NULL DEFAULT 'widget';

CREATE INDEX "conversations_owner_user_id_idx" ON "chat"."conversations"("owner_user_id");
