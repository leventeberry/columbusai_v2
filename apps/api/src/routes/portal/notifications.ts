import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { routeParam } from "../../lib/route-params.js";
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

export async function patchPortalNotificationRead(
  req: RequestWithAuth,
  res: Response,
): Promise<void> {
  const id = routeParam(req.params.id);
  const userId = req.auth!.user.id;
  const existing = await prisma.portalNotification.findUnique({ where: { id } });
  if (!existing || existing.user_id !== userId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const row = await prisma.portalNotification.update({
    where: { id },
    data: { read_at: new Date() },
  });

  res.json({
    notification: {
      id: row.id,
      recipientId: row.user_id,
      kind: row.kind,
      title: row.title,
      body: row.body ?? "",
      readAt: row.read_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
    },
  });
}

export async function postPortalNotificationsReadAll(
  req: RequestWithAuth,
  res: Response,
): Promise<void> {
  const userId = req.auth!.user.id;
  await prisma.portalNotification.updateMany({
    where: { user_id: userId, read_at: null },
    data: { read_at: new Date() },
  });
  res.json({ ok: true });
}
