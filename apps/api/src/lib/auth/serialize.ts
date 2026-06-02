import type { AppUserRole, ClientSource, PortalClientRole } from "@columbusai/db";
import type { AuthUser } from "./session.js";
import { mapUserRoleToAppRoles } from "./session.js";

export interface MeResponse {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    role: AppUserRole;
    roles: ("admin" | "member" | "viewer")[];
  };
  client_memberships: {
    client_id: string;
    client_source: ClientSource;
    role: PortalClientRole;
  }[];
}

export function serializeMe(
  user: AuthUser,
  memberships: { client_id: string; client_source: ClientSource; role: PortalClientRole }[],
): MeResponse {
  return {
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      job_title: user.job_title,
      role: user.role,
      roles: mapUserRoleToAppRoles(user.role),
    },
    client_memberships: memberships,
  };
}
