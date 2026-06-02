import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

export async function getPortalNotifications(req: RequestWithAuth, res: Response): Promise<void> {
  const userId = req.auth!.user.id;
  const rows = await prisma.portalNotification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  res.json({
    notifications: rows.map((n) => ({
      id: n.id,
      recipientId: n.user_id,
      workItemId: n.href?.includes("/") ? (n.href.split("/").pop() ?? "") : "",
      kind: n.kind,
      title: n.title,
      body: n.body ?? "",
      readAt: n.read_at?.toISOString() ?? null,
      createdAt: n.created_at.toISOString(),
    })),
    unreadCount: rows.filter((n) => !n.read_at).length,
  });
}
