import type { User } from "@/data/entities";
import { isPortalMockEnabled } from "@/lib/portal-config";
import { getPortalMe } from "@/lib/portal-session";
import { dbSnapshot, dbSubscribe } from "@/data/mock/db";

function rosterToUser(r: {
  id: string;
  email: string;
  displayName: string | null;
  initials: string;
  kind: "agency" | "client";
}): User {
  return {
    id: r.id,
    name: r.displayName ?? r.email.split("@")[0] ?? r.email,
    email: r.email,
    initials: r.initials,
    kind: r.kind,
  };
}

export function list(): User[] {
  if (isPortalMockEnabled()) return dbSnapshot().users;
  const me = getPortalMe();
  return me?.portal.roster?.map(rosterToUser) ?? [];
}

export function get(id: string | null | undefined): User | undefined {
  if (!id) return undefined;
  if (isPortalMockEnabled()) {
    return dbSnapshot().users.find((u) => u.id === id);
  }
  const me = getPortalMe();
  const fromRoster = me?.portal.roster?.find((u) => u.id === id);
  if (fromRoster) return rosterToUser(fromRoster);
  if (me?.user.id === id) {
    return {
      id: me.user.id,
      email: me.user.email,
      name: me.user.display_name ?? me.user.email,
      initials: (me.user.display_name ?? me.user.email).slice(0, 2).toUpperCase(),
      kind: me.portal.isAgency ? "agency" : "client",
    };
  }
  return undefined;
}

export function listByClient(clientId: string): User[] {
  if (isPortalMockEnabled()) {
    return dbSnapshot().users.filter((u) => u.clientId === clientId);
  }
  return list().filter((u) => u.kind === "client");
}

export function listAgency(): User[] {
  return list().filter((u) => u.kind === "agency");
}

export const subscribe = dbSubscribe;
