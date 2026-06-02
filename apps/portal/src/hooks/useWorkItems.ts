import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { WorkItemFilter } from "@/data/repositories/work-items";
import type { Notification, WorkComment, WorkItem } from "@/data/entities";
import { isPortalMockEnabled } from "@/lib/portal-config";
import {
  fetchPortalWorkItem,
  fetchPortalWorkItems,
  fetchPortalNotifications,
  postPortalWorkComment,
  patchPortalWorkItem,
  createPortalWorkItem,
  type PortalNotificationRow,
} from "@/lib/portal.functions";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import * as workItemsRepo from "@/data/repositories/work-items";
import * as commentsRepo from "@/data/repositories/comments";
import * as attachmentsRepo from "@/data/repositories/attachments";
import * as activityRepo from "@/data/repositories/activity";
import * as notificationsRepo from "@/data/repositories/notifications";
import { search, type SearchActor } from "@/data/services/search";

function applyFilter(items: WorkItem[], filter: WorkItemFilter): WorkItem[] {
  return items.filter((w) => {
    if (filter.clientId && w.clientId !== filter.clientId) return false;
    if (filter.statuses?.length && !filter.statuses.includes(w.status)) return false;
    if (filter.priorities?.length && !filter.priorities.includes(w.priority)) return false;
    if (filter.types?.length && !filter.types.includes(w.type)) return false;
    return true;
  });
}

export function useWorkItems(filter: WorkItemFilter = {}) {
  const { activeClientId } = usePortalWorkspace();
  const clientId = filter.clientId ?? activeClientId ?? undefined;
  const fetchFn = useServerFn(fetchPortalWorkItems);
  const mock = isPortalMockEnabled();

  const query = useQuery({
    queryKey: ["portal-work-items", clientId, mock],
    queryFn: async () => {
      if (mock) return workItemsRepo.list(filter);
      const items = await fetchFn({ data: { clientId } });
      return applyFilter(items, filter);
    },
    staleTime: 15_000,
  });

  return query.data ?? [];
}

export function useWorkItem(id: string) {
  const fetchFn = useServerFn(fetchPortalWorkItem);
  const mock = isPortalMockEnabled();

  const query = useQuery({
    queryKey: ["portal-work-item", id, mock],
    queryFn: async () => {
      if (mock) {
        const item = workItemsRepo.get(id);
        if (!item) return null;
        return {
          workItem: item,
          comments: commentsRepo.listFor(id, true),
          attachments: attachmentsRepo.listFor(id),
          activity: activityRepo.listFor(id),
        };
      }
      return fetchFn({ data: { id } });
    },
    enabled: !!id,
    staleTime: 10_000,
  });

  return query.data?.workItem;
}

export function useWorkItemDetail(id: string) {
  const fetchFn = useServerFn(fetchPortalWorkItem);
  const mock = isPortalMockEnabled();

  return useQuery({
    queryKey: ["portal-work-item", id, mock],
    queryFn: async () => {
      if (mock) {
        const item = workItemsRepo.get(id);
        if (!item) return null;
        return {
          workItem: item,
          comments: commentsRepo.listFor(id, true),
          attachments: attachmentsRepo.listFor(id),
          activity: activityRepo.listFor(id),
        };
      }
      return fetchFn({ data: { id } });
    },
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useComments(workItemId: string, includeInternal: boolean) {
  const detail = useWorkItemDetail(workItemId);
  const comments = detail.data?.comments ?? [];
  if (!includeInternal) {
    return comments.filter((c) => c.visibility === "public");
  }
  return comments;
}

export function useAttachments(workItemId: string) {
  const detail = useWorkItemDetail(workItemId);
  return detail.data?.attachments ?? [];
}

export function useActivity(workItemId: string) {
  const detail = useWorkItemDetail(workItemId);
  return detail.data?.activity ?? [];
}

export function usePortalWorkMutations() {
  const qc = useQueryClient();
  const createFn = useServerFn(createPortalWorkItem);
  const patchFn = useServerFn(patchPortalWorkItem);
  const commentFn = useServerFn(postPortalWorkComment);

  const invalidate = async (workItemId?: string) => {
    await qc.invalidateQueries({ queryKey: ["portal-work-items"] });
    if (workItemId) {
      await qc.invalidateQueries({ queryKey: ["portal-work-item", workItemId] });
    }
  };

  return {
    createWorkItem: async (input: {
      clientId: string;
      title: string;
      description: string;
      type: string;
      priority: "low" | "medium" | "high" | "critical";
    }) => {
      const item = await createFn({ data: input });
      await invalidate();
      return item;
    },
    changeStatus: async (id: string, status: WorkItem["status"]) => {
      await patchFn({ data: { id, status } });
      await invalidate(id);
    },
    changePriority: async (id: string, priority: WorkItem["priority"]) => {
      await patchFn({ data: { id, priority } });
      await invalidate(id);
    },
    addComment: async (input: {
      workItemId: string;
      body: string;
      visibility: WorkComment["visibility"];
    }) => {
      await commentFn({ data: input });
      await invalidate(input.workItemId);
    },
    invalidate,
  };
}

function mapApiNotification(row: PortalNotificationRow): Notification {
  return {
    id: row.id,
    recipientId: row.recipientId,
    workItemId: row.workItemId,
    activityId: "",
    kind: row.kind as Notification["kind"],
    title: row.title,
    body: row.body,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export function useNotifications() {
  const { currentUserId } = usePortalWorkspace();
  const fetchFn = useServerFn(fetchPortalNotifications);
  const mock = isPortalMockEnabled();

  const query = useQuery({
    queryKey: ["portal-notifications", currentUserId, mock],
    queryFn: async () => {
      if (mock) {
        return {
          notifications: notificationsRepo.listFor(currentUserId),
          unreadCount: notificationsRepo.unreadCount(currentUserId),
        };
      }
      const res = await fetchFn();
      return {
        notifications: res.notifications.map(mapApiNotification),
        unreadCount: res.unreadCount,
      };
    },
    enabled: !!currentUserId || mock,
    staleTime: 30_000,
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
  };
}

export function useGlobalSearch(query: string, actor: SearchActor) {
  const { activeClientId, isAgency } = usePortalWorkspace();
  const clientId = actor.clientId ?? activeClientId ?? undefined;
  const items = useWorkItems(
    clientId && !isAgency ? { clientId } : actor.clientId ? { clientId: actor.clientId } : {},
  );
  const mock = isPortalMockEnabled();

  return useMemo(() => {
    if (mock) return search(query, actor);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { workItems: [], clients: [], comments: [], attachments: [] };
    }
    const scoped = actor.clientId ? items.filter((w) => w.clientId === actor.clientId) : items;
    const workItems = scoped
      .filter((w) => `${w.id} ${w.title} ${w.description}`.toLowerCase().includes(q))
      .slice(0, 8);
    return { workItems, clients: [], comments: [], attachments: [] };
  }, [mock, query, actor, items]);
}
