import type {
  WorkItem,
  WorkPriority,
  WorkStatus,
  WorkType,
} from "@/data/entities";
import { dbMutate, dbSnapshot, dbSubscribe, nextWorkItemId } from "@/data/mock/db";

export type WorkItemFilter = {
  clientId?: string;
  statuses?: WorkStatus[];
  priorities?: WorkPriority[];
  types?: WorkType[];
  assigneeId?: string;
  query?: string;
  includeArchived?: boolean;
};

export function list(filter: WorkItemFilter = {}): WorkItem[] {
  const q = filter.query?.toLowerCase();
  return dbSnapshot()
    .workItems.filter((w) => {
      if (!filter.includeArchived && w.archivedAt) return false;
      if (filter.clientId && w.clientId !== filter.clientId) return false;
      if (filter.statuses?.length && !filter.statuses.includes(w.status)) return false;
      if (filter.priorities?.length && !filter.priorities.includes(w.priority)) return false;
      if (filter.types?.length && !filter.types.includes(w.type)) return false;
      if (
        filter.assigneeId &&
        !w.assigneeIds.includes(filter.assigneeId) &&
        w.primaryAssigneeId !== filter.assigneeId
      )
        return false;
      if (q && !`${w.title} ${w.id} ${w.description}`.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function get(id: string): WorkItem | undefined {
  return dbSnapshot().workItems.find((w) => w.id === id);
}

export type InsertInput = Omit<WorkItem, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export function insert(input: InsertInput): WorkItem {
  const now = new Date().toISOString();
  const item: WorkItem = {
    ...input,
    id: input.id ?? nextWorkItemId(),
    createdAt: now,
    updatedAt: now,
  };
  dbMutate((cur) => ({ ...cur, workItems: [item, ...cur.workItems] }));
  return item;
}

export function update(id: string, patch: Partial<WorkItem>): WorkItem | undefined {
  let updated: WorkItem | undefined;
  dbMutate((cur) => ({
    ...cur,
    workItems: cur.workItems.map((w) => {
      if (w.id !== id) return w;
      updated = { ...w, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    }),
  }));
  return updated;
}

export function softDelete(id: string): void {
  update(id, { archivedAt: new Date().toISOString() });
}

export const subscribe = dbSubscribe;
