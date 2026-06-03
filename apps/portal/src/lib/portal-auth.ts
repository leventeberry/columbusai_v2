import type { Role } from "./mock/portal";
import { portalAuthLogout, portalAuthMe } from "@/lib/auth.functions";
import {
  applyPortalSession,
  clearPortalSession,
  getEffectiveRole,
  getPortalMe,
  setRoleOverride,
} from "@/lib/portal-session";
import type { PortalMeResponse } from "@/lib/portal-session";

export type { Role };

export function isLoggedIn(): boolean {
  return !!getPortalMe();
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error ?? "Login failed");
    }
    const meRes = await fetch(`${apiUrl}/api/portal/me`, {
      credentials: "include",
    });
    if (!meRes.ok) {
      throw new Error("Login failed");
    }
    const me = (await meRes.json()) as PortalMeResponse;
    applyPortalSession(me);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Login failed" };
  }
}

export async function signOut(): Promise<void> {
  await portalAuthLogout();
  clearPortalSession();
}

export async function hydrateSession(): Promise<boolean> {
  const me = await portalAuthMe();
  if (!me) {
    clearPortalSession();
    return false;
  }
  applyPortalSession(me);
  return true;
}

export function getRole(): Role {
  return getEffectiveRole();
}

export function setRole(role: Role): void {
  setRoleOverride(role);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("portal-role-changed"));
  }
}

export function isAgency(role: Role): boolean {
  return role === "agency_admin" || role === "agency_member";
}

export function canSeeInternalNotes(role: Role): boolean {
  return isAgency(role);
}

export function canAssign(role: Role): boolean {
  return isAgency(role);
}

export function canChangeStatus(role: Role): boolean {
  return isAgency(role);
}

export function canPostInternalNotes(role: Role): boolean {
  return isAgency(role);
}

const CLIENT_ROLES: Role[] = ["owner", "admin", "viewer"];
const AGENCY_ROLES: Role[] = ["agency_admin", "agency_member"];
const ALL_ROLES: Role[] = [...CLIENT_ROLES, ...AGENCY_ROLES];

export const NAV_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ALL_ROLES,
  "/website": ["owner", "admin", ...AGENCY_ROLES],
  "/automations": ["owner", "admin", ...AGENCY_ROLES],
  "/integrations": ["owner", "admin", ...AGENCY_ROLES],
  "/leads": ["owner", "admin", ...AGENCY_ROLES],
  "/analytics": ALL_ROLES,
  "/documents": ALL_ROLES,
  "/reports": ALL_ROLES,
  "/requests": ALL_ROLES,
  "/billing": ["owner", ...AGENCY_ROLES],
  "/support": ["owner", "admin", ...AGENCY_ROLES],
  "/settings": ["owner", "admin", ...AGENCY_ROLES],
  "/admin/work": AGENCY_ROLES,
};

export function canAccess(path: string, role: Role): boolean {
  const allowed = NAV_PERMISSIONS[path];
  return !allowed || allowed.includes(role);
}
