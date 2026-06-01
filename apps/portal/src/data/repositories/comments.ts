import type { WorkComment, WorkCommentVisibility } from "@/data/entities";
import { dbMutate, dbSnapshot, dbSubscribe, nextId } from "@/data/mock/db";

export function listFor(workItemId: string, includeInternal: boolean): WorkComment[] {
  return dbSnapshot()
    .comments.filter(
      (c) => c.workItemId === workItemId && (includeInternal || c.visibility === "public"),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function listAll(): WorkComment[] {
  return dbSnapshot().comments;
}

export type InsertCommentInput = {
  workItemId: string;
  authorId: string;
  body: string;
  visibility: WorkCommentVisibility;
  mentions?: string[];
};

export function insert(input: InsertCommentInput): WorkComment {
  const c: WorkComment = {
    id: nextId("cm"),
    workItemId: input.workItemId,
    authorId: input.authorId,
    body: input.body,
    visibility: input.visibility,
    mentions: input.mentions ?? [],
    createdAt: new Date().toISOString(),
  };
  dbMutate((cur) => ({ ...cur, comments: [...cur.comments, c] }));
  return c;
}

export const subscribe = dbSubscribe;
