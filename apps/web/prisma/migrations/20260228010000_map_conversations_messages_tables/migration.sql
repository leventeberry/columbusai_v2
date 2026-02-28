-- Rename chat tables to match @@map (conversations, messages) for spec alignment.
ALTER TABLE "chat"."Conversation" RENAME TO "conversations";
ALTER TABLE "chat"."Message" RENAME TO "messages";
