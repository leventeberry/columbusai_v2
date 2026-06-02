import type { Request, Response } from "express";
import type { AppUser, AppUserRole } from "@columbusai/db";
import { prisma } from "../prisma.js";
import {
  getCookieDomain,
  getSessionCookieName,
  getSessionTtlMs,
  isSecureCookie,
} from "./config.js";
import { generateSessionToken, hashToken } from "./crypto.js";

export type AuthUser = Pick<
  AppUser,
  "id" | "email" | "role" | "status" | "display_name" | "avatar_url" | "job_title"
>;

export interface SessionContext {
  user: AuthUser;
  sessionId: string;
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

export function getSessionTokenFromRequest(req: Request): string | null {
  const name = getSessionCookieName();
  const cookies = parseCookies(req);
  const token = cookies[name];
  return token && token.length > 0 ? token : null;
}

export function setSessionCookie(res: Response, token: string): void {
  const maxAge = Math.floor(getSessionTtlMs() / 1000);
  const parts = [
    `${getSessionCookieName()}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isSecureCookie()) parts.push("Secure");
  const domain = getCookieDomain();
  if (domain) parts.push(`Domain=${domain}`);
  res.append("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: Response): void {
  const parts = [
    `${getSessionCookieName()}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isSecureCookie()) parts.push("Secure");
  const domain = getCookieDomain();
  if (domain) parts.push(`Domain=${domain}`);
  res.append("Set-Cookie", parts.join("; "));
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string; ip?: string },
): Promise<{ token: string; sessionId: string }> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + getSessionTtlMs());
  const session = await prisma.session.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      user_agent: meta?.userAgent ?? null,
      ip_address: meta?.ip ?? null,
    },
  });
  await prisma.appUser.update({
    where: { id: userId },
    data: { last_login_at: new Date() },
  });
  return { token, sessionId: session.id };
}

export async function resolveSession(req: Request): Promise<SessionContext | null> {
  const token = getSessionTokenFromRequest(req);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const now = new Date();
  const session = await prisma.session.findFirst({
    where: {
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: { gt: now },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          display_name: true,
          avatar_url: true,
          job_title: true,
        },
      },
    },
  });
  if (!session || session.user.status !== "ACTIVE") return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { last_seen_at: now },
  });

  return { user: session.user, sessionId: session.id };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revoked_at: new Date() },
  });
}

export async function revokeSessionByToken(req: Request): Promise<void> {
  const token = getSessionTokenFromRequest(req);
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.session.updateMany({
    where: { token_hash: tokenHash, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export function isStaffRole(role: AppUserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF";
}

export function isAdminRole(role: AppUserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function mapUserRoleToAppRoles(role: AppUserRole): ("admin" | "member" | "viewer")[] {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return ["admin"];
    case "STAFF":
      return ["member"];
    case "VIEWER":
      return ["viewer"];
    default:
      return [];
  }
}
