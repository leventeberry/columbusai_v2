import type { Client, User, WorkAttachment, WorkComment, WorkItem } from "@/data/entities";
import * as attachmentsRepo from "@/data/repositories/attachments";
import * as clientsRepo from "@/data/repositories/clients";
import * as commentsRepo from "@/data/repositories/comments";
import * as usersRepo from "@/data/repositories/users";
import * as workItemsRepo from "@/data/repositories/work-items";

export type SearchActor = {
  userId: string;
  /** When set, scope results to this client (client users); agency users pass `undefined`. */
  clientId?: string;
};

export type SearchResults = {
  workItems: WorkItem[];
  clients: Client[];
  comments: Array<{ comment: WorkComment; workItem: WorkItem | undefined }>;
  attachments: Array<{ attachment: WorkAttachment; workItem: WorkItem | undefined }>;
};

const EMPTY: SearchResults = { workItems: [], clients: [], comments: [], attachments: [] };

export function search(query: string, actor: SearchActor): SearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return EMPTY;

  const allItems = workItemsRepo.list({ includeArchived: false });
  const scoped = actor.clientId ? allItems.filter((w) => w.clientId === actor.clientId) : allItems;

  const itemIndex = new Map(scoped.map((w) => [w.id, w] as const));

  const workItems = scoped
    .filter((w) => `${w.id} ${w.title} ${w.description}`.toLowerCase().includes(q))
    .slice(0, 8);

  const clients = actor.clientId
    ? []
    : clientsRepo
        .list()
        .filter((c) => `${c.name} ${c.industry}`.toLowerCase().includes(q))
        .slice(0, 5);

  const comments = commentsRepo
    .listAll()
    .filter((c) => {
      if (!c.body.toLowerCase().includes(q)) return false;
      if (!itemIndex.has(c.workItemId)) return false;
      // Hide internal comments from client users
      if (actor.clientId && c.visibility === "internal") return false;
      return true;
    })
    .slice(0, 5)
    .map((c) => ({ comment: c, workItem: itemIndex.get(c.workItemId) }));

  const attachments = attachmentsRepo
    .listAll()
    .filter((a) => a.name.toLowerCase().includes(q) && itemIndex.has(a.workItemId))
    .slice(0, 5)
    .map((a) => ({ attachment: a, workItem: itemIndex.get(a.workItemId) }));

  return { workItems, clients, comments, attachments };
}

export function listAgencyUsers(): User[] {
  return usersRepo.listAgency();
}
