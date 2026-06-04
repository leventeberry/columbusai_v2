import type { Request, Response, NextFunction } from "express";
import { AppUserRole } from "@columbusai/db";
import { resolveSession } from "../lib/auth/session.js";
import { applyRateLimitPreset } from "../lib/rateLimit.js";
import type { RequestWithAuth } from "./requireSession.js";

const READ_ROLES: AppUserRole[] = [
  AppUserRole.SUPER_ADMIN,
  AppUserRole.ADMIN,
  AppUserRole.STAFF,
  AppUserRole.VIEWER,
];

const WRITE_ROLES: AppUserRole[] = [
  AppUserRole.SUPER_ADMIN,
  AppUserRole.ADMIN,
  AppUserRole.STAFF,
];

async function allowLegacyAdminToken(
  req: Request,
  res: Response,
): Promise<boolean> {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  const provided =
    req.headers["x-admin-token"] ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (expected && typeof provided === "string" && provided === expected) {
    return applyRateLimitPreset(req, res, "adminToken");
  }
  return true;
}

async function authenticateAdminSession(
  req: RequestWithAuth,
  roles: AppUserRole[],
): Promise<boolean> {
  try {
    const ctx = await resolveSession(req);
    if (ctx && roles.includes(ctx.user.role)) {
      req.auth = ctx;
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function adminAccessCore(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
  roles: AppUserRole[],
): Promise<void> {
  if (!(await allowLegacyAdminToken(req, res))) return;

  const expected = process.env.ADMIN_API_TOKEN?.trim();
  const provided =
    req.headers["x-admin-token"] ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (expected && typeof provided === "string" && provided === expected) {
    next();
    return;
  }

  if (await authenticateAdminSession(req, roles)) {
    next();
    return;
  }

  if (!expected) {
    console.error("[adminAuth] ADMIN_API_TOKEN is not set and no valid session");
    res.status(503).json({ error: "Admin API not configured" });
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}

export async function requireAdminReadAccess(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return adminAccessCore(req, res, next, READ_ROLES);
}

export async function requireAdminWriteAccess(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return adminAccessCore(req, res, next, WRITE_ROLES);
}

/** @deprecated Use requireAdminReadAccess or requireAdminWriteAccess */
export async function requireAdminAccess(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return requireAdminReadAccess(req, res, next);
}
