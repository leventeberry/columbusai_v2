import type { WorkAttachment } from "@/data/entities";
import { dbMutate, dbSnapshot, dbSubscribe, nextId } from "@/data/mock/db";

export function listFor(workItemId: string): WorkAttachment[] {
  return dbSnapshot()
    .attachments.filter((a) => a.workItemId === workItemId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function listAll(): WorkAttachment[] {
  return dbSnapshot().attachments;
}

export function get(id: string): WorkAttachment | undefined {
  return dbSnapshot().attachments.find((a) => a.id === id);
}

export type InsertAttachmentInput = {
  workItemId: string;
  uploaderId: string;
  name: string;
  size: number;
  mime: string;
  url: string;
};

export function insert(input: InsertAttachmentInput): WorkAttachment {
  const a: WorkAttachment = {
    id: nextId("att"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  dbMutate((cur) => ({ ...cur, attachments: [...cur.attachments, a] }));
  return a;
}

export function remove(id: string): void {
  dbMutate((cur) => ({ ...cur, attachments: cur.attachments.filter((a) => a.id !== id) }));
}

export const subscribe = dbSubscribe;
