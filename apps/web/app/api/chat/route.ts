import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db/prisma";
import { MessageRole } from "@prisma/client";
import { getVectorDatabaseUrl, getVectorPool, ensureVectorSchema, searchChunks } from "@/lib/vector-db";
import { rateLimit } from "@/lib/rateLimit";
import { getMissingRequiredEnv } from "@/lib/env";
import { withTimer } from "@/lib/timing";
import { postChatBodySchema } from "./schemas";
import { recordChatMetrics } from "@/lib/metrics-lite";

const CONTEXT_MESSAGE_LIMIT = 20;
const DEFAULT_INSTRUCTIONS =
  "You are a helpful assistant for Columbus AI Automation Solutions LLC. Be professional and concise.";

const DEFAULT_EMBED_MODEL = "text-embedding-3-small";
const DEFAULT_RETRIEVAL_K = 5;

export interface ChatTimings {
  db_read_ms: number;
  embed_ms: number;
  retrieval_ms: number;
  openai_ms: number;
  db_write_ms: number;
  total_ms: number;
}

// Phase 2: non-streaming only; stream=true is ignored (optional SSE in a later phase).
export async function POST(request: NextRequest) {
  const request_id = crypto.randomUUID();
  const totalStartMs = Date.now();
  try {
    const missing = getMissingRequiredEnv();
    if (missing.length > 0) {
      console.error(
        JSON.stringify({
          level: "error",
          request_id,
          message: "Configuration error",
          missing_keys: missing,
        })
      );
      return NextResponse.json(
        { error: "Configuration error. Check server logs." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = postChatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: conversationId (UUID), message (non-empty) required." },
        { status: 400 }
      );
    }
    const { conversationId: bodyConvId, message } = parsed.data;

    // Phase 4: rate limit (per-IP, optional per-conversation)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ??
      (request as NextRequest & { ip?: string }).ip ??
      "unknown";
    const scope = process.env.RATE_LIMIT_SCOPE ?? "ip";
    const rlKey =
      `rl:chat:ip:${ip}` +
      (scope === "ip+conversation" && bodyConvId ? `:conv:${bodyConvId}` : "");
    const limit = Math.max(1, parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "20", 10) || 20);
    const windowSeconds = Math.max(1, parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "300", 10) || 300);
    const rl = await rateLimit({ key: rlKey, limit, windowSeconds });
    if (!rl.allowed) {
      recordChatMetrics(429, 0);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // --- db_read: resolve/create conversation, create user message, load context ---
    const dbRead = await withTimer("db_read", async () => {
      let convId: string;
      if (bodyConvId) {
        const existing = await prisma.conversation.findUnique({
          where: { id: bodyConvId },
        });
        if (!existing) {
          return { notFound: true as const, convId: null as unknown as string };
        }
        convId = bodyConvId;
      } else {
        const conv = await prisma.conversation.create({ data: {} });
        convId = conv.id;
      }

      await prisma.message.create({
        data: {
          conversation_id: convId,
          role: MessageRole.user,
          content: message,
        },
      });

      const total = await prisma.message.count({
        where: { conversation_id: convId },
      });
      const skip = Math.max(0, total - CONTEXT_MESSAGE_LIMIT);
      const messagesForContext = await prisma.message.findMany({
        where: { conversation_id: convId },
        orderBy: { created_at: "asc" },
        skip,
        take: CONTEXT_MESSAGE_LIMIT,
      });

      return { notFound: false as const, convId, messagesForContext };
    });

    if (dbRead.result.notFound) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const convId = dbRead.result.convId;
    const messagesForContext = dbRead.result.messagesForContext;
    const db_read_ms = dbRead.ms;

    const input = messagesForContext
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const lastMsg = messagesForContext[messagesForContext.length - 1];
    const previousResponseId =
      lastMsg?.role === "assistant" && lastMsg.openai_response_id
        ? lastMsg.openai_response_id
        : undefined;

    const apiKey = process.env.OPENAI_API_KEY!;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const store =
      process.env.OPENAI_STORE !== "false" && process.env.OPENAI_STORE !== "0";
    const client = new OpenAI({ apiKey });

    const retrievalK = Math.max(1, parseInt(process.env.RETRIEVAL_K ?? String(DEFAULT_RETRIEVAL_K), 10) || DEFAULT_RETRIEVAL_K);
    const embedModel = process.env.OPENAI_EMBED_MODEL ?? DEFAULT_EMBED_MODEL;
    let embed_ms = 0;
    let retrieval_ms = 0;
    let retrievalChunkIds: string[] = [];
    let instructions = DEFAULT_INSTRUCTIONS;

    if (getVectorDatabaseUrl()) {
      try {
        const embedResult = await withTimer("embed", () =>
          client.embeddings.create({
            model: embedModel,
            input: message,
          })
        );
        embed_ms = embedResult.ms;
        const queryEmbedding = embedResult.result.data[0]?.embedding;
        if (queryEmbedding?.length) {
          const retrievalResult = await withTimer("retrieval", async () => {
            const pool = getVectorPool();
            await ensureVectorSchema(pool);
            return searchChunks(pool, queryEmbedding, retrievalK);
          });
          retrieval_ms = retrievalResult.ms;
          const chunks = retrievalResult.result;
          retrievalChunkIds = chunks.map((c) => c.id);
          if (chunks.length > 0) {
            const contextBlock =
              "Relevant context:\n" +
              chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n");
            instructions = DEFAULT_INSTRUCTIONS + "\n\n" + contextBlock;
          }
        }
      } catch (retrievalErr) {
        console.warn(
          JSON.stringify({
            level: "warn",
            request_id,
            message: "Retrieval failed (continuing without context)",
            error: String(retrievalErr),
          })
        );
      }
    }

    const openaiResult = await withTimer("openai", () => {
      const createParams: {
        model: string;
        instructions: string;
        input: { role: "user" | "assistant"; content: string }[];
        store: boolean;
        previous_response_id?: string;
      } = {
        model,
        instructions,
        input,
        store,
      };
      if (previousResponseId) createParams.previous_response_id = previousResponseId;
      return client.responses.create(createParams);
    });
    const openai_ms = openaiResult.ms;
    const response = openaiResult.result;

    const assistantText = response.output_text ?? "";
    const requestId =
      "request_id" in response && typeof response.request_id === "string"
        ? response.request_id
        : null;
    const usage = response.usage;
    const tokenInput = usage?.input_tokens ?? null;
    const tokenOutput = usage?.output_tokens ?? null;
    const outputItems =
      Array.isArray(response.output) && response.output.length > 0
        ? (response.output as object[])
        : null;

    const dbWrite = await withTimer("db_write", () =>
      prisma.message.create({
        data: {
          conversation_id: convId,
          role: MessageRole.assistant,
          content: assistantText,
          openai_response_id: response.id,
          previous_openai_response_id: previousResponseId ?? null,
          store,
          model,
          latency_ms: openai_ms,
          request_id: requestId,
          token_input: tokenInput,
          token_output: tokenOutput,
          output_items: outputItems ?? undefined,
        },
      })
    );

    const db_write_ms = dbWrite.ms;
    const total_ms = Date.now() - totalStartMs;
    const timings: ChatTimings = {
      db_read_ms,
      embed_ms,
      retrieval_ms,
      openai_ms,
      db_write_ms,
      total_ms,
    };

    await prisma.message.update({
      where: { id: dbWrite.result.id },
      data: {
        meta: {
          timings: { ...timings },
          retrieval_k: retrievalK,
          retrieval_chunk_ids: retrievalChunkIds,
        },
      },
    });

    recordChatMetrics(200, timings.total_ms);

    console.info(
      JSON.stringify({
        level: "info",
        request_id,
        message: "chat_request",
        conversation_id: convId,
        openai_response_id: response.id,
        openai_request_id: requestId,
        ...timings,
        retrieval_k: retrievalK,
        retrieval_chunk_ids: retrievalChunkIds,
      })
    );

    return NextResponse.json(
      {
        conversationId: convId,
        responseId: response.id,
        text: assistantText,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch (e) {
    const total_ms = Date.now() - totalStartMs;
    const status = e && typeof e === "object" && "status" in e ? 502 : 500;
    recordChatMetrics(status, total_ms);
    if (e && typeof e === "object" && "status" in e) {
      console.error(
        JSON.stringify({
          level: "error",
          request_id,
          message: "OpenAI error",
          error: String(e),
        })
      );
      return NextResponse.json(
        { error: "AI temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }
    console.error(
      JSON.stringify({
        level: "error",
        request_id,
        message: "chat_error",
        error: String(e),
      })
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
