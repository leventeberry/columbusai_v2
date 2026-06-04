import { isAgencyRole } from "./roles.js";

export type PortalCommentRow = {
  id: string;
  work_item_id: string;
  author_id: string;
  body: string;
  visibility: string;
  mentions: string[];
  created_at: Date;
};

export type PortalActivityRow = {
  id: string;
  work_item_id: string;
  actor_id: string;
  kind: string;
  from_value: string | null;
  to_value: string | null;
  created_at: Date;
};

export function filterCommentsForViewer<T extends PortalCommentRow>(
  role: string,
  comments: T[],
): T[] {
  if (isAgencyRole(role)) return comments;
  return comments.filter((c) => c.visibility !== "internal");
}

export function filterActivityForViewer(
  role: string,
  activity: PortalActivityRow[],
): PortalActivityRow[] {
  if (isAgencyRole(role)) return activity;
  return activity.filter((a) => a.kind !== "comment_added");
}

export function serializePortalComment(c: PortalCommentRow) {
  return {
    id: c.id,
    workItemId: c.work_item_id,
    authorId: c.author_id,
    body: c.body,
    visibility: c.visibility,
    mentions: c.mentions,
    createdAt: c.created_at.toISOString(),
  };
}

export function serializePortalActivity(a: PortalActivityRow) {
  return {
    id: a.id,
    workItemId: a.work_item_id,
    actorId: a.actor_id,
    kind: a.kind,
    from: a.from_value ?? undefined,
    to: a.to_value ?? undefined,
    createdAt: a.created_at.toISOString(),
  };
}
