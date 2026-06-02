import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

export async function getAdminConversations(req: RequestWithAuth, res: Response): Promise<void> {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updated_at: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  res.json({
    conversations: conversations.map((c) => {
      const last = c.messages[0];
      return {
        id: c.id,
        agent: "Chexi",
        channel: "web",
        preview: last?.content?.slice(0, 120) ?? "",
        messageCount: c._count.messages,
        sentiment: "neutral" as const,
        updatedAt: c.updated_at.toISOString(),
        createdAt: c.created_at.toISOString(),
      };
    }),
    totalToday: await prisma.message.count({
      where: {
        created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  });
}
