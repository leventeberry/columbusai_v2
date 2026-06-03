import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { apiFetch } from "@/lib/api.server";
import { requireApiSession } from "@/lib/auth-middleware";
import type {
  WorkActivity,
  WorkAttachment,
  WorkComment,
  WorkItem,
  WorkPriority,
  WorkStatus,
  WorkType,
} from "@/data/entities";

export type PortalWorkItemDetail = {
  workItem: WorkItem;
  comments: WorkComment[];
  attachments: WorkAttachment[];
  activity: WorkActivity[];
};

const listInput = z.object({ clientId: z.string().optional() }).optional();

export const fetchPortalWorkItems = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => listInput.parse(input))
  .handler(async ({ data }) => {
    const qs = data?.clientId ? `?clientId=${encodeURIComponent(data.clientId)}` : "";
    const res = await apiFetch<{ workItems: WorkItem[] }>(`/api/portal/work-items${qs}`);
    return res.workItems;
  });

export const fetchPortalWorkItem = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    return apiFetch<PortalWorkItemDetail>(`/api/portal/work-items/${encodeURIComponent(data.id)}`);
  });

const createInput = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const createPortalWorkItem = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => createInput.parse(input))
  .handler(async ({ data }) => {
    const res = await apiFetch<{ workItem: WorkItem }>("/api/portal/work-items", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.workItem;
  });

const patchInput = z.object({
  id: z.string().min(1),
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

export const patchPortalWorkItem = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => patchInput.parse(input))
  .handler(async ({ data }) => {
    const res = await apiFetch<{ workItem: WorkItem }>(
      `/api/portal/work-items/${encodeURIComponent(data.id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: data.status,
          priority: data.priority,
        }),
      },
    );
    return res.workItem;
  });

const commentInput = z.object({
  workItemId: z.string().min(1),
  body: z.string().min(1).max(10000),
  visibility: z.enum(["public", "internal"]).default("public"),
});

export const postPortalWorkComment = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => commentInput.parse(input))
  .handler(async ({ data }) => {
    const res = await apiFetch<{ comment: WorkComment }>(
      `/api/portal/work-items/${encodeURIComponent(data.workItemId)}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ body: data.body, visibility: data.visibility }),
      },
    );
    return res.comment;
  });

export type PortalNotificationRow = {
  id: string;
  recipientId: string;
  workItemId: string;
  kind: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export const fetchPortalNotifications = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async () => {
    return apiFetch<{ notifications: PortalNotificationRow[]; unreadCount: number }>(
      "/api/portal/notifications",
    );
  });

export const patchPortalNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    return apiFetch<{ notification: PortalNotificationRow }>(
      `/api/portal/notifications/${encodeURIComponent(data.id)}/read`,
      { method: "PATCH" },
    );
  });

export const postPortalNotificationsReadAll = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .handler(async () => {
    return apiFetch<{ ok: boolean }>("/api/portal/notifications/read-all", { method: "POST" });
  });

export type { WorkType, WorkStatus, WorkPriority };
