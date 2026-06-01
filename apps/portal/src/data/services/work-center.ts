// Work-center service. Composes repositories + always emits activity +
// notifications. Components and hooks call THIS for mutations.

import type {
  WorkAttachment,
  WorkComment,
  WorkItem,
  WorkPriority,
  WorkStatus,
  WorkType,
} from "@/data/entities";
import * as activityRepo from "@/data/repositories/activity";
import * as attachmentsRepo from "@/data/repositories/attachments";
import * as commentsRepo from "@/data/repositories/comments";
import * as workItemsRepo from "@/data/repositories/work-items";
import { notify } from "@/data/services/notifications";

// ───────── Reads (re-exposed so components only depend on services) ─────────

export const listWorkItems = workItemsRepo.list;
export const getWorkItem = workItemsRepo.get;
export const getCommentsFor = commentsRepo.listFor;
export const getAttachmentsFor = attachmentsRepo.listFor;
export const getActivityFor = activityRepo.listFor;

export type { WorkItemFilter } from "@/data/repositories/work-items";

// ───────── Mutations ─────────

export type CreateWorkItemInput = {
  title: string;
  description: string;
  type: WorkType;
  priority: WorkPriority;
  clientId: string;
  createdBy: string;
};

export function createWorkItem(input: CreateWorkItemInput): WorkItem {
  const item = workItemsRepo.insert({
    title: input.title,
    description: input.description,
    type: input.type,
    status: "requested",
    priority: input.priority,
    clientId: input.clientId,
    createdBy: input.createdBy,
    primaryAssigneeId: null,
    assigneeIds: [],
    watcherIds: [],
    tags: [],
  });
  const ev = activityRepo.insert({
    workItemId: item.id,
    actorId: input.createdBy,
    kind: "created",
  });
  notify(ev, item);
  return item;
}

export function updateWorkItem(
  id: string,
  patch: Partial<Pick<WorkItem, "title" | "description" | "tags" | "dueDate">>,
  actorId: string,
): WorkItem | undefined {
  const before = workItemsRepo.get(id);
  if (!before) return undefined;
  const after = workItemsRepo.update(id, patch);
  if (after && (patch.title || patch.description || patch.dueDate || patch.tags)) {
    const ev = activityRepo.insert({ workItemId: id, actorId, kind: "created" /* generic edit */ });
    notify(ev, after);
  }
  return after;
}

export function changeStatus(workItemId: string, status: WorkStatus, actorId: string): void {
  const before = workItemsRepo.get(workItemId);
  if (!before || before.status === status) return;
  const after = workItemsRepo.update(workItemId, { status });
  if (!after) return;
  const ev = activityRepo.insert({
    workItemId,
    actorId,
    kind: "status_changed",
    from: before.status,
    to: status,
  });
  notify(ev, after);
  if (status === "completed") {
    const done = activityRepo.insert({ workItemId, actorId, kind: "completed" });
    notify(done, after);
  }
}

export function changePriority(
  workItemId: string,
  priority: WorkPriority,
  actorId: string,
): void {
  const before = workItemsRepo.get(workItemId);
  if (!before || before.priority === priority) return;
  const after = workItemsRepo.update(workItemId, { priority });
  if (!after) return;
  const ev = activityRepo.insert({
    workItemId,
    actorId,
    kind: "priority_changed",
    from: before.priority,
    to: priority,
  });
  notify(ev, after);
}

export function assignWorkItem(
  workItemId: string,
  userId: string | null,
  actorId: string,
): void {
  const before = workItemsRepo.get(workItemId);
  if (!before) return;
  const assigneeIds = userId ? Array.from(new Set([userId, ...before.assigneeIds])) : [];
  const after = workItemsRepo.update(workItemId, { primaryAssigneeId: userId, assigneeIds });
  if (!after) return;
  const ev = activityRepo.insert({
    workItemId,
    actorId,
    kind: "assignee_changed",
    from: before.primaryAssigneeId ?? undefined,
    to: userId ?? undefined,
  });
  notify(ev, after, { extraRecipientIds: userId ? [userId] : [] });
}

export function addWatcher(workItemId: string, userId: string, actorId: string): void {
  const before = workItemsRepo.get(workItemId);
  if (!before || before.watcherIds.includes(userId)) return;
  const after = workItemsRepo.update(workItemId, {
    watcherIds: [...before.watcherIds, userId],
  });
  if (!after) return;
  const ev = activityRepo.insert({
    workItemId,
    actorId,
    kind: "watcher_added",
    to: userId,
  });
  notify(ev, after);
}

export function removeWatcher(workItemId: string, userId: string, actorId: string): void {
  const before = workItemsRepo.get(workItemId);
  if (!before || !before.watcherIds.includes(userId)) return;
  const after = workItemsRepo.update(workItemId, {
    watcherIds: before.watcherIds.filter((u) => u !== userId),
  });
  if (!after) return;
  const ev = activityRepo.insert({
    workItemId,
    actorId,
    kind: "watcher_removed",
    to: userId,
  });
  notify(ev, after);
}

/** Compatibility helper used by existing WorkItemDetail. */
export function toggleWatcher(workItemId: string, userId: string): void {
  const w = workItemsRepo.get(workItemId);
  if (!w) return;
  if (w.watcherIds.includes(userId)) removeWatcher(workItemId, userId, userId);
  else addWatcher(workItemId, userId, userId);
}

export type AddCommentInput = {
  workItemId: string;
  authorId: string;
  body: string;
  visibility: "public" | "internal";
  mentions?: string[];
};

export function addComment(input: AddCommentInput): WorkComment {
  const comment = commentsRepo.insert(input);
  workItemsRepo.update(input.workItemId, {});
  const item = workItemsRepo.get(input.workItemId);
  const ev = activityRepo.insert({
    workItemId: input.workItemId,
    actorId: input.authorId,
    kind: "comment_added",
  });
  if (item) {
    notify(ev, item, {
      agencyOnly: input.visibility === "internal",
      extraRecipientIds: input.mentions,
    });
  }
  return comment;
}

export type UploadAttachmentInput = {
  workItemId: string;
  uploaderId: string;
  name: string;
  size: number;
  mime: string;
  url: string;
};

export function uploadAttachment(input: UploadAttachmentInput): WorkAttachment {
  const att = attachmentsRepo.insert(input);
  workItemsRepo.update(input.workItemId, {});
  const item = workItemsRepo.get(input.workItemId);
  const ev = activityRepo.insert({
    workItemId: input.workItemId,
    actorId: input.uploaderId,
    kind: "attachment_added",
    to: input.name,
  });
  if (item) notify(ev, item);
  return att;
}

export function removeAttachment(attachmentId: string, actorId: string): void {
  const att = attachmentsRepo.get(attachmentId);
  if (!att) return;
  attachmentsRepo.remove(attachmentId);
  const item = workItemsRepo.get(att.workItemId);
  const ev = activityRepo.insert({
    workItemId: att.workItemId,
    actorId,
    kind: "attachment_removed",
    to: att.name,
  });
  if (item) notify(ev, item);
}

export function archiveWorkItem(workItemId: string, actorId: string): void {
  const after = workItemsRepo.update(workItemId, { archivedAt: new Date().toISOString() });
  if (!after) return;
  const ev = activityRepo.insert({ workItemId, actorId, kind: "archived" });
  notify(ev, after);
}
