const AGENCY_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "STAFF", "VIEWER"]);

export function isAgencyRole(role: string): boolean {
  return AGENCY_ROLES.has(role);
}

export function isAgencyWriteRole(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF";
}
