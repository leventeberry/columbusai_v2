import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { apiFetch, getApiBaseUrl } from "@/lib/api.server";
import { SESSION_COOKIE } from "@/lib/auth-middleware";
import { extractSessionTokenFromSetCookie } from "@/lib/extract-session-cookie";
import type { PortalMeResponse } from "@/lib/portal-session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function appendSessionCookie(token: string): void {
  const request = getRequest();
  if (!request) return;
  const maxAge = 60 * 60 * 24 * 14;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const existing = request.headers.get("cookie") ?? "";
  const pair = `${SESSION_COOKIE}=${encodeURIComponent(token)}`;
  const merged = existing ? `${existing}; ${pair}` : pair;
  request.headers.set("cookie", merged);
  const g = globalThis as typeof globalThis & { __columbusSetCookie?: string };
  g.__columbusSetCookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const portalAuthLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as PortalMeResponse & { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Login failed");
    const token = extractSessionTokenFromSetCookie(res, SESSION_COOKIE);
    if (!token) throw new Error("Login failed");
    appendSessionCookie(token);
    return apiFetch<PortalMeResponse>("/api/portal/me");
  });

export const portalAuthLogout = createServerFn({ method: "POST" }).handler(async () => {
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

export const portalAuthMe = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const cookie = request?.headers.get("cookie");
  if (!cookie?.includes(SESSION_COOKIE)) return null;
  try {
    return await apiFetch<PortalMeResponse>("/api/portal/me");
  } catch {
    return null;
  }
});
