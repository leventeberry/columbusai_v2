// Notification service. Owns recipient computation + describe text.
// Only the work-center service should call `notify()`.

import type { Notification, User, WorkActivity, WorkItem } from "@/data/entities";
import { workStatusLabel } from "@/data/entities";
import * as notificationsRepo from "@/data/repositories/notifications";
import * as usersRepo from "@/data/repositories/users";

function describe(activity: WorkActivity, item: WorkItem): { title: string; body: string } {
  const actor = usersRepo.get(activity.actorId)?.name ?? "Someone";
  const title = item.title;
  switch (activity.kind) {
    case "created":
      return { title: "New work item", body: `${actor} submitted "${title}"` };
    case "status_changed":
      return {
        title: "Status updated",
        body: `${actor} moved "${title}" → ${
          activity.to
            ? ((workStatusLabel as Record<string, string>)[activity.to] ?? activity.to)
            : ""
        }`,
      };
    case "assignee_changed": {
      const to = activity.to ? (usersRepo.get(activity.to)?.name ?? "someone") : "unassigned";
      return { title: "Assignment changed", body: `${actor} assigned "${title}" to ${to}` };
    }
    case "priority_changed":
      return {
        title: "Priority changed",
        body: `${actor} set "${title}" priority to ${activity.to}`,
      };
    case "watcher_added":
      return { title: "New watcher", body: `${actor} is now watching "${title}"` };
    case "watcher_removed":
      return { title: "Watcher removed", body: `${actor} stopped watching "${title}"` };
    case "comment_added":
      return { title: "New comment", body: `${actor} commented on "${title}"` };
    case "attachment_added":
      return {
        title: "New attachment",
        body: `${actor} added ${activity.to ?? "a file"} to "${title}"`,
      };
    case "attachment_removed":
      return {
        title: "Attachment removed",
        body: `${actor} removed an attachment from "${title}"`,
      };
    case "archived":
      return { title: "Work archived", body: `${actor} archived "${title}"` };
    case "completed":
      return { title: "Work completed", body: `${actor} completed "${title}"` };
  }
}

export type NotifyOptions = {
  /** Restrict recipients to agency users only (used for internal-visibility comments). */
  agencyOnly?: boolean;
  /** Additional explicit recipients (e.g., mentions). */
  extraRecipientIds?: string[];
};

/**
 * Fan-out a single activity to the appropriate recipient set:
 * watchers + primary assignee + creator (+ explicit extras), minus actor.
 */
export function notify(
  activity: WorkActivity,
  item: WorkItem,
  opts: NotifyOptions = {},
): Notification[] {
  const recipientIds = new Set<string>();
  for (const w of item.watcherIds) recipientIds.add(w);
  if (item.primaryAssigneeId) recipientIds.add(item.primaryAssigneeId);
  if (item.createdBy) recipientIds.add(item.createdBy);
  for (const e of opts.extraRecipientIds ?? []) recipientIds.add(e);
  recipientIds.delete(activity.actorId);

  const all: User[] = usersRepo.list();
  const valid = new Set(all.map((u) => u.id));

  const filtered = Array.from(recipientIds).filter((id) => {
    if (!valid.has(id)) return false;
    if (opts.agencyOnly) {
      const u = all.find((x) => x.id === id);
      return u?.kind === "agency";
    }
    return true;
  });

  const { title, body } = describe(activity, item);
  return filtered.map((recipientId) =>
    notificationsRepo.insert({
      recipientId,
      workItemId: activity.workItemId,
      activityId: activity.id,
      kind: activity.kind,
      title,
      body,
    }),
  );
}

export function createNotification(input: notificationsRepo.InsertNotificationInput): Notification {
  return notificationsRepo.insert(input);
}

export function markRead(notificationId: string, recipientId: string): void {
  notificationsRepo.markRead(notificationId, recipientId);
}

export function markAllRead(recipientId: string): void {
  notificationsRepo.markAllRead(recipientId);
}

export function getUnreadCount(recipientId: string): number {
  return notificationsRepo.unreadCount(recipientId);
}
