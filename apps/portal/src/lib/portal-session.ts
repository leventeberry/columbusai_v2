import type { Role } from "@/lib/mock/portal";

export type PortalMeResponse = {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    roles: ("admin" | "member" | "viewer")[];
  };
  client_memberships: { client_id: string; client_source: string; role: string }[];
  portal: {
    isAgency: boolean;
    clients: { id: string; name: string; industry: string | null }[];
    activeClientId: string | null;
  };
};

let cachedMe: PortalMeResponse | null = null;
let roleOverride: Role | null = null;

export function setRoleOverride(role: Role | null): void {
  roleOverride = role;
}

export function applyPortalSession(me: PortalMeResponse): void {
  cachedMe = me;
  roleOverride = null;
}

export function clearPortalSession(): void {
  cachedMe = null;
  roleOverride = null;
}

export function getEffectiveRole(): Role {
  const me = getPortalMe();
  if (!me) return "viewer";
  if (roleOverride) return roleOverride;
  return mapMeToRole(me);
}

export function mapMeToRole(me: PortalMeResponse): Role {
  if (me.portal.isAgency) return "agency_admin";
  const m = me.client_memberships[0];
  if (!m) return "viewer";
  switch (m.role) {
    case "OWNER":
      return "owner";
    case "ADMIN":
      return "admin";
    default:
      return "viewer";
  }
}

export function getPortalMe(): PortalMeResponse | null {
  return cachedMe;
}
