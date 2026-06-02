import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";
import { getPortalMemberships, serializeWorkItem, userCanAccessClient } from "../../lib/portal/repository.js";

export async function getPortalWorkItems(req: RequestWithAuth, res: Response): Promise<void> {
  const user = req.auth!.user;
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;

  let clientFilter: string[] | undefined;
  if (user.role === "CLIENT") {
    const memberships = await getPortalMemberships(user.id);
    clientFilter = memberships.map((m) => m.client_id);
  } else if (clientId) {
    const ok = await userCanAccessClient(user.id, user.role, clientId);
    if (!ok) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    clientFilter = [clientId];
  }

  const items = await prisma.portalWorkItem.findMany({
    where: clientFilter ? { client_id: { in: clientFilter } } : undefined,
    orderBy: { updated_at: "desc" },
  });

  res.json({ workItems: items.map(serializeWorkItem) });
}

export async function getPortalWorkItem(req: RequestWithAuth, res: Response): Promise<void> {
  const id = req.params.id;
  const item = await prisma.portalWorkItem.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const ok = await userCanAccessClient(req.auth!.user.id, req.auth!.user.role, item.client_id);
  if (!ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [comments, attachments, activity] = await Promise.all([
    prisma.portalWorkComment.findMany({ where: { work_item_id: id }, orderBy: { created_at: "asc" } }),
    prisma.portalWorkAttachment.findMany({ where: { work_item_id: id } }),
    prisma.portalWorkActivity.findMany({ where: { work_item_id: id }, orderBy: { created_at: "asc" } }),
  ]);

  res.json({
    workItem: serializeWorkItem(item),
    comments: comments.map((c) => ({
      id: c.id,
      workItemId: c.work_item_id,
      authorId: c.author_id,
      body: c.body,
      visibility: c.visibility,
      mentions: c.mentions,
      createdAt: c.created_at.toISOString(),
    })),
    attachments: attachments.map((a) => ({
      id: a.id,
      workItemId: a.work_item_id,
      uploaderId: a.uploader_id,
      name: a.name,
      size: a.size,
      mime: a.mime,
      url: a.url,
      createdAt: a.created_at.toISOString(),
    })),
    activity: activity.map((a) => ({
      id: a.id,
      workItemId: a.work_item_id,
      actorId: a.actor_id,
      kind: a.kind,
      from: a.from_value ?? undefined,
      to: a.to_value ?? undefined,
      createdAt: a.created_at.toISOString(),
    })),
  });
}

const createSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function postPortalWorkItem(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const ok = await userCanAccessClient(
    req.auth!.user.id,
    req.auth!.user.role,
    parsed.data.clientId,
  );
  if (!ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = `WI-${Date.now()}`;
  const item = await prisma.portalWorkItem.create({
    data: {
      id,
      client_id: parsed.data.clientId,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      type: parsed.data.type as never,
      priority: (parsed.data.priority ?? "medium") as never,
      created_by_user_id: req.auth!.user.id,
      status: "requested",
    },
  });

  await prisma.portalWorkActivity.create({
    data: {
      work_item_id: id,
      actor_id: req.auth!.user.id,
      kind: "created",
    },
  });

  res.status(201).json({ workItem: serializeWorkItem(item) });
}
