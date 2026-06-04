import type { Request } from "express";
import { resolveSession } from "../auth/session.js";
import { prisma } from "../prisma.js";
import { createWidgetToken, verifyWidgetToken } from "./widgetToken.js";

export const CONVERSATION_TOKEN_HEADER = "x-conversation-token";

export type ConversationAuth =
  | { kind: "widget"; conversationId: string }
  | { kind: "user"; conversationId: string; userId: string }
  | { kind: "bootstrap" };

export function extractConversationToken(req: Request): string | null {
  const header = req.headers[CONVERSATION_TOKEN_HEADER];
  if (typeof header === "string" && header.trim()) return header.trim();
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export async function authorizeConversationAccess(
  req: Request,
  conversationId: string | undefined,
): Promise<
  | { ok: true; auth: ConversationAuth }
  | { ok: false; status: 401 | 403; error: string }
> {
  if (!conversationId) {
    const session = await resolveSession(req);
    if (session) {
      return { ok: true, auth: { kind: "bootstrap" } };
    }
    return { ok: true, auth: { kind: "bootstrap" } };
  }

  const session = await resolveSession(req);
  if (session) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, owner_user_id: true, principal_type: true },
    });
    if (!conv) {
      return { ok: false, status: 403, error: "Forbidden" };
    }
    if (
      conv.principal_type === "user" &&
      conv.owner_user_id === session.user.id
    ) {
      return {
        ok: true,
        auth: { kind: "user", conversationId, userId: session.user.id },
      };
    }
  }

  const token = extractConversationToken(req);
  if (!token) {
    return { ok: false, status: 401, error: "Conversation token required" };
  }
  const verified = verifyWidgetToken(token, conversationId);
  if (!verified.ok) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });
  if (!conv) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true, auth: { kind: "widget", conversationId } };
}

export function issueTokenForConversation(conversationId: string): string {
  return createWidgetToken(conversationId);
}

export async function createBootstrapConversation(
  req: Request,
): Promise<{ id: string; conversationToken?: string }> {
  const session = await resolveSession(req);
  if (session) {
    const conv = await prisma.conversation.create({
      data: {
        principal_type: "user",
        owner_user_id: session.user.id,
      },
    });
    return { id: conv.id };
  }
  const conv = await prisma.conversation.create({
    data: { principal_type: "widget" },
  });
  return { id: conv.id, conversationToken: createWidgetToken(conv.id) };
}
