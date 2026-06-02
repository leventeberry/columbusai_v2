import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getApiBaseUrl } from "@/lib/api.server";

export const SESSION_COOKIE = "columbus_session";

export const requireApiSession = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  if (!request?.headers) {
    throw new Error("Unauthorized: No request headers available");
  }
  const cookie = request.headers.get("cookie");
  if (!cookie?.includes(SESSION_COOKIE)) {
    throw new Error("Unauthorized: No session");
  }

  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) {
    throw new Error("Unauthorized: Invalid session");
  }
  const me = (await res.json()) as { user: { id: string; roles: string[] } };

  return next({
    context: {
      userId: me.user.id,
      user: me.user,
      roles: me.user.roles,
    },
  });
});

export async function assertAdminRole(roles: string[]) {
  if (!roles.includes("admin")) {
    throw new Error("Forbidden: admin role required");
  }
}
