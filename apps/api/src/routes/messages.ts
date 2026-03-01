import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { MessageRole } from "@columbusai/db";
import {
  postMessagesBodySchema,
  getMessagesQuerySchema,
} from "./schemas/messages.js";

export async function postMessages(req: Request, res: Response): Promise<void> {
  try {
    const parsed = postMessagesBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
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

    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.conversation.create({
        data: {},
      });
      convId = conv.id;
    } else {
      const existing = await prisma.conversation.findUnique({
        where: { id: convId },
      });
      if (!existing) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        conversation_id: convId,
        role: MessageRole.user,
        content,
      },
    });

    res.status(200).json({
      conversationId: convId,
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
