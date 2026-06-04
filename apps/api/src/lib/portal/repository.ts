import { ClientSource } from "@columbusai/db";
import { prisma } from "../prisma.js";

import { isAgencyRole } from "./roles.js";

export { isAgencyRole, isAgencyWriteRole } from "./roles.js";

export async function getPortalMemberships(userId: string) {
  return prisma.clientUser.findMany({
    where: { user_id: userId, client_source: ClientSource.PORTAL },
  });
}

export async function userCanAccessClient(
  userId: string,
  role: string,
  clientId: string,
): Promise<boolean> {
  if (isAgencyRole(role)) return true;
  const m = await prisma.clientUser.findFirst({
    where: { user_id: userId, client_id: clientId, client_source: ClientSource.PORTAL },
  });
  return !!m;
}

export async function allowedClientIds(
  userId: string,
  role: string,
): Promise<string[] | "all"> {
  if (isAgencyRole(role)) return "all";
  const memberships = await getPortalMemberships(userId);
  return memberships.map((m) => m.client_id);
}

export function serializeWorkItem(w: {
  id: string;
  client_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  created_by_user_id: string;
  primary_assignee_id: string | null;
  assignee_ids: string[];
  watcher_ids: string[];
  tags: string[];
  due_date: Date | null;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: w.id,
    title: w.title,
    description: w.description,
    type: w.type,
    status: w.status,
    priority: w.priority,
    clientId: w.client_id,
    createdBy: w.created_by_user_id,
    primaryAssigneeId: w.primary_assignee_id,
    assigneeIds: w.assignee_ids,
    watcherIds: w.watcher_ids,
    tags: w.tags,
    createdAt: w.created_at.toISOString(),
    updatedAt: w.updated_at.toISOString(),
    dueDate: w.due_date?.toISOString(),
    archivedAt: w.archived_at?.toISOString(),
  };
}
