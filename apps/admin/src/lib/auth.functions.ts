import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getApiBaseUrl } from "@/lib/api.server";
import { SESSION_COOKIE } from "@/lib/auth-middleware";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthMeUser = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  roles: ("admin" | "member" | "viewer")[];
};

export type AuthMeResponse = {
  user: AuthMeUser;
  client_memberships: unknown[];
};

function appendSessionCookie(token: string): void {
  const request = getRequest();
  if (!request) return;
  const maxAge = 60 * 60 * 24 * 14;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const existing = request.headers.get("cookie") ?? "";
  const pair = `${SESSION_COOKIE}=${encodeURIComponent(token)}`;
  const merged = existing ? `${existing}; ${pair}` : pair;
  request.headers.set("cookie", merged);
  // Expose Set-Cookie on the response via global hook used by Nitro
  const g = globalThis as typeof globalThis & {
    __columbusSetCookie?: string;
  };
  g.__columbusSetCookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const authLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as AuthMeResponse & { error?: string; sessionToken?: string };
    if (!res.ok) {
      throw new Error(body.error ?? "Login failed");
    }
    if (body.sessionToken) {
      appendSessionCookie(body.sessionToken);
    }
    return { user: body.user, roles: body.user.roles };
  });

export const authLogout = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  const cookie = request?.headers.get("cookie");
  await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
  });
  const g = globalThis as typeof globalThis & { __columbusSetCookie?: string };
  g.__columbusSetCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  return { ok: true };
});

export const authMe = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const cookie = request?.headers.get("cookie");
  if (!cookie?.includes(SESSION_COOKIE)) {
    return null;
  }
  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) return null;
  return (await res.json()) as AuthMeResponse;
});
