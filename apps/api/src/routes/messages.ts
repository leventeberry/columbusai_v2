import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { MessageRole } from "@columbusai/db";
import { applyRateLimitPreset } from "../lib/rateLimit.js";
import {
  authorizeConversationAccess,
  createBootstrapConversation,
} from "../lib/chat/conversationAuth.js";
import {
  postMessagesBodySchema,
  getMessagesQuerySchema,
} from "./schemas/messages.js";

export async function postMessages(req: Request, res: Response): Promise<void> {
  try {
    const parsed = postMessagesBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        details: z.flattenError(parsed.error),
      });
      return;
    }
    const { conversationId, content, role } = parsed.data;
    if (role !== undefined && role !== "user") {
      res.status(400).json({
        error: "Phase 1 only allows role: user",
      });
      return;
    }

    const convSuffix = conversationId ? `:conv:${conversationId}` : "";
    if (!(await applyRateLimitPreset(req, res, "messages", convSuffix))) return;

    const access = await authorizeConversationAccess(req, conversationId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }

    let convId = conversationId;
    let conversationToken: string | undefined;
    let message: Awaited<ReturnType<typeof prisma.message.create>>;
    if (!convId) {
      const created = await createBootstrapConversation(req);
      convId = created.id;
      conversationToken = created.conversationToken;
      message = await prisma.message.create({
        data: {
          conversation_id: convId,
          role: MessageRole.user,
          content,
        },
      });
    } else {
      message = await prisma.message.create({
        data: {
          conversation_id: convId,
          role: MessageRole.user,
          content,
        },
      });
    }

    res.status(200).json({
      conversationId: convId,
      ...(conversationToken ? { conversationToken } : {}),
      message: {
        id: message.id,
        conversationId: message.conversation_id,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
      },
    });
  } catch (e) {
    console.error("POST /api/messages", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const parsed = getMessagesQuerySchema.safeParse({
      conversationId: req.query.conversationId ?? undefined,
    });
    if (!parsed.success) {
      res.status(400).json({
        error: "conversationId is required and must be a valid UUID",
      });
      return;
    }
    const { conversationId } = parsed.data;

    const convSuffix = `:conv:${conversationId}`;
    if (!(await applyRateLimitPreset(req, res, "messages", convSuffix))) return;

    const access = await authorizeConversationAccess(req, conversationId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: "asc" },
    });

    res.status(200).json({
      messages: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    });
  } catch (e) {
    console.error("GET /api/messages", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
