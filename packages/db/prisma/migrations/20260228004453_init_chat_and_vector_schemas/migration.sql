-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "chat";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "chat"."MessageRole" AS ENUM ('user', 'assistant', 'system', 'developer', 'tool');

-- CreateTable
CREATE TABLE "chat"."Conversation" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "external_conversation_key" TEXT,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."Message" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "chat"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openai_response_id" TEXT,
    "previous_openai_response_id" TEXT,
    "store" BOOLEAN,
    "output_items" JSONB,
    "request_id" TEXT,
    "model" TEXT,
    "latency_ms" INTEGER,
    "token_input" INTEGER,
    "token_output" INTEGER,
    "meta" JSONB,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vector"."VectorReserved" (
    "id" TEXT NOT NULL,

    CONSTRAINT "VectorReserved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_conversation_id_idx" ON "chat"."Message"("conversation_id");

-- AddForeignKey
ALTER TABLE "chat"."Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
