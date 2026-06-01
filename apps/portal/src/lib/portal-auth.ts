import type { Role } from "./mock/portal";

const SESSION_KEY = "portal_session";
const ROLE_KEY = "portal_role";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return (
    localStorage.getItem(SESSION_KEY) === "1" ||
    document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_KEY}=1`))
  );
}

export function signIn(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, "1");
  localStorage.setItem("portal_email", email);
  if (!localStorage.getItem(ROLE_KEY)) localStorage.setItem(ROLE_KEY, "owner");
  document.cookie = `${SESSION_KEY}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function getRole(): Role {
  if (typeof window === "undefined") return "owner";
  return (localStorage.getItem(ROLE_KEY) as Role) || "owner";
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event("portal-role-changed"));
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
  "/requests": ALL_ROLES, // Client "Work Center" — visible to everyone
  "/billing": ["owner", ...AGENCY_ROLES],
  "/support": ["owner", "admin", ...AGENCY_ROLES],
  "/settings": ["owner", "admin", ...AGENCY_ROLES],
  "/admin/work": AGENCY_ROLES,
};

export function canAccess(path: string, role: Role): boolean {
  const allowed = NAV_PERMISSIONS[path];
  return !allowed || allowed.includes(role);
}
