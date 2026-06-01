import type { WorkActivity, WorkActivityKind } from "@/data/entities";
import { dbMutate, dbSnapshot, dbSubscribe, nextId } from "@/data/mock/db";

export function listFor(workItemId: string): WorkActivity[] {
  return dbSnapshot()
    .activity.filter((a) => a.workItemId === workItemId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function listFeed(limit = 50): WorkActivity[] {
  return [...dbSnapshot().activity]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export type InsertActivityInput = {
  workItemId: string;
  actorId: string;
  kind: WorkActivityKind;
  from?: string;
  to?: string;
};

export function insert(input: InsertActivityInput): WorkActivity {
  const ev: WorkActivity = {
    id: nextId("ac"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  dbMutate((cur) => ({ ...cur, activity: [...cur.activity, ev] }));
  return ev;
}

export const subscribe = dbSubscribe;
