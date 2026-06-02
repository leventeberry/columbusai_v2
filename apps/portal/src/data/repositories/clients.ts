import type { Client } from "@/data/entities";
import { isPortalMockEnabled } from "@/lib/portal-config";
import { getPortalMe } from "@/lib/portal-session";
import { dbSnapshot, dbSubscribe } from "@/data/mock/db";

export function list(): Client[] {
  if (isPortalMockEnabled()) return dbSnapshot().clients;
  const me = getPortalMe();
  return (
    me?.portal.clients.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry ?? "",
    })) ?? []
  );
}

export function get(id: string | null | undefined): Client | undefined {
  if (!id) return undefined;
  return list().find((c) => c.id === id);
}

export const subscribe = dbSubscribe;
