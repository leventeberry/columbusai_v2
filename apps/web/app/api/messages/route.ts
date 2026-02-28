import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MessageRole } from "@prisma/client";
import {
  postMessagesBodySchema,
  getMessagesQuerySchema,
} from "./schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postMessagesBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { conversationId, content, role } = parsed.data;
    if (role !== undefined && role !== "user") {
      return NextResponse.json(
        { error: "Phase 1 only allows role: user" },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        conversation_id: convId,
        role: MessageRole.user,
        content,
      },
    });

    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = getMessagesQuerySchema.safeParse({
      conversationId: searchParams.get("conversationId") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "conversationId is required and must be a valid UUID" },
        { status: 400 }
      );
    }
    const { conversationId } = parsed.data;

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
