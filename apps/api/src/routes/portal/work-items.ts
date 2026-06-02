import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";
import {
  allowedClientIds,
  isAgencyRole,
  serializeWorkItem,
  userCanAccessClient,
} from "../../lib/portal/repository.js";

export async function getPortalWorkItems(req: RequestWithAuth, res: Response): Promise<void> {
  const user = req.auth!.user;
  const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
  const scope = await allowedClientIds(user.id, user.role);

  if (scope !== "all" && scope.length === 0) {
    res.json({ workItems: [] });
    return;
  }

  let clientFilter: string[] | undefined;
  if (scope !== "all") {
    clientFilter = scope;
  }
  if (clientId) {
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

const patchSchema = z.object({
  status: z
    .enum([
      "requested",
      "in_review",
      "planned",
      "in_progress",
      "waiting_on_client",
      "testing",
      "completed",
      "cancelled",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function patchPortalWorkItem(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.status && !parsed.data.priority)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const id = req.params.id;
  const existing = await prisma.portalWorkItem.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const ok = await userCanAccessClient(req.auth!.user.id, req.auth!.user.role, existing.client_id);
  if (!ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!isAgencyRole(req.auth!.user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const item = await prisma.portalWorkItem.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
    },
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await prisma.portalWorkActivity.create({
      data: {
        work_item_id: id,
        actor_id: req.auth!.user.id,
        kind: "status_changed",
        from_value: existing.status,
        to_value: parsed.data.status,
      },
    });
    if (parsed.data.status === "completed") {
      await prisma.portalWorkActivity.create({
        data: {
          work_item_id: id,
          actor_id: req.auth!.user.id,
          kind: "completed",
        },
      });
    }
  }

  if (parsed.data.priority && parsed.data.priority !== existing.priority) {
    await prisma.portalWorkActivity.create({
      data: {
        work_item_id: id,
        actor_id: req.auth!.user.id,
        kind: "priority_changed",
        from_value: existing.priority,
        to_value: parsed.data.priority,
      },
    });
  }

  res.json({ workItem: serializeWorkItem(item) });
}

const commentSchema = z.object({
  body: z.string().min(1).max(10000),
  visibility: z.enum(["public", "internal"]).default("public"),
});

export async function postPortalWorkComment(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  if (parsed.data.visibility === "internal" && !isAgencyRole(req.auth!.user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = req.params.id;
  const existing = await prisma.portalWorkItem.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const ok = await userCanAccessClient(req.auth!.user.id, req.auth!.user.role, existing.client_id);
  if (!ok) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const comment = await prisma.portalWorkComment.create({
    data: {
      work_item_id: id,
      author_id: req.auth!.user.id,
      body: parsed.data.body,
      visibility: parsed.data.visibility,
    },
  });

  await prisma.portalWorkActivity.create({
    data: {
      work_item_id: id,
      actor_id: req.auth!.user.id,
      kind: "comment_added",
    },
  });

  res.status(201).json({
    comment: {
      id: comment.id,
      workItemId: comment.work_item_id,
      authorId: comment.author_id,
      body: comment.body,
      visibility: comment.visibility,
      mentions: comment.mentions,
      createdAt: comment.created_at.toISOString(),
    },
  });
}
