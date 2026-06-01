import type { Notification, NotificationKind } from "@/data/entities";
import { dbMutate, dbSnapshot, dbSubscribe, nextId } from "@/data/mock/db";

export function listFor(recipientId: string, limit = 50): Notification[] {
  return dbSnapshot()
    .notifications.filter((n) => n.recipientId === recipientId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export function unreadCount(recipientId: string): number {
  return dbSnapshot().notifications.filter(
    (n) => n.recipientId === recipientId && n.readAt === null,
  ).length;
}

export type InsertNotificationInput = {
  recipientId: string;
  workItemId: string;
  activityId: string;
  kind: NotificationKind;
  title: string;
  body: string;
};

export function insert(input: InsertNotificationInput): Notification {
  const n: Notification = {
    id: nextId("nf"),
    ...input,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  dbMutate((cur) => ({ ...cur, notifications: [...cur.notifications, n] }));
  return n;
}

export function markRead(notificationId: string, recipientId: string): void {
  const now = new Date().toISOString();
  dbMutate((cur) => ({
    ...cur,
    notifications: cur.notifications.map((n) =>
      n.id === notificationId && n.recipientId === recipientId && !n.readAt
        ? { ...n, readAt: now }
        : n,
    ),
  }));
}

export function markAllRead(recipientId: string): void {
  const now = new Date().toISOString();
  dbMutate((cur) => ({
    ...cur,
    notifications: cur.notifications.map((n) =>
      n.recipientId === recipientId && !n.readAt ? { ...n, readAt: now } : n,
    ),
  }));
}

export const subscribe = dbSubscribe;
