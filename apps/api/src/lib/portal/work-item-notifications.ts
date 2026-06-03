import { AppUserRole } from "@columbusai/db";
import { prisma } from "../prisma.js";
import { createPortalNotification } from "../onboarding/notifications.js";

type WorkItemRow = {
  id: string;
  client_id: string;
  title: string;
  created_by_user_id: string;
  primary_assignee_id: string | null;
  assignee_ids: string[];
  watcher_ids: string[];
};

export async function notifyWorkItemActivity(input: {
  item: WorkItemRow;
  actorId: string;
  kind: string;
  title: string;
  body?: string;
  agencyOnly?: boolean;
}): Promise<void> {
  const recipientIds = new Set<string>();
  for (const id of input.item.watcher_ids) recipientIds.add(id);
  if (input.item.primary_assignee_id) recipientIds.add(input.item.primary_assignee_id);
  recipientIds.add(input.item.created_by_user_id);
  recipientIds.delete(input.actorId);

  if (recipientIds.size === 0) return;

  const users = await prisma.appUser.findMany({
    where: { id: { in: Array.from(recipientIds) } },
    select: { id: true, role: true },
  });

  const href = `/work/${input.item.id}`;
  for (const user of users) {
    if (input.agencyOnly && user.role === AppUserRole.CLIENT) continue;
    await createPortalNotification({
      userId: user.id,
      kind: input.kind,
      title: input.title,
      body: input.body,
      href,
    });
  }
}

export async function notifyWorkItemCreated(
  item: WorkItemRow,
  actorId: string,
): Promise<void> {
  await notifyWorkItemActivity({
    item,
    actorId,
    kind: "created",
    title: "New work item",
    body: `"${item.title}" was submitted`,
  });
}

export async function notifyWorkItemStatusChanged(input: {
  item: WorkItemRow;
  actorId: string;
  toStatus: string;
}): Promise<void> {
  await notifyWorkItemActivity({
    item: input.item,
    actorId: input.actorId,
    kind: "status_changed",
    title: "Status updated",
    body: `"${input.item.title}" → ${input.toStatus.replace(/_/g, " ")}`,
  });
}

export async function notifyWorkItemComment(input: {
  item: WorkItemRow;
  actorId: string;
  agencyOnly: boolean;
}): Promise<void> {
  await notifyWorkItemActivity({
    item: input.item,
    actorId: input.actorId,
    kind: "comment_added",
    title: "New comment",
    body: `New comment on "${input.item.title}"`,
    agencyOnly: input.agencyOnly,
  });
}
