import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { apiFetch, getApiBaseUrl } from "@/lib/api.server";

export const SESSION_COOKIE = "columbus_session";

export const requireApiSession = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const cookie = request?.headers.get("cookie");
    if (!cookie?.includes(SESSION_COOKIE)) {
      throw new Error("Unauthorized: No session");
    }
    const me = await apiFetch<{ user: { id: string } }>("/api/auth/me");
    return next({ context: { userId: me.user.id, cookie } });
  },
);
