import type { Request, Response, NextFunction } from "express";
import { AppUserRole } from "@columbusai/db";
import { resolveSession } from "../lib/auth/session.js";
import type { RequestWithAuth } from "./requireSession.js";

const STAFF_ROLES: AppUserRole[] = [
  AppUserRole.SUPER_ADMIN,
  AppUserRole.ADMIN,
  AppUserRole.STAFF,
  AppUserRole.VIEWER,
];

/**
 * Allows admin sales/ops routes via HttpOnly session (staff roles) or legacy X-Admin-Token.
 */
export async function requireAdminAccess(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  const provided =
    req.headers["x-admin-token"] ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (expected && typeof provided === "string" && provided === expected) {
    next();
    return;
  }

  try {
    const ctx = await resolveSession(req);
    if (ctx && STAFF_ROLES.includes(ctx.user.role)) {
      req.auth = ctx;
      next();
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  if (!expected) {
    console.error("[adminAuth] ADMIN_API_TOKEN is not set and no valid session");
    res.status(503).json({ error: "Admin API not configured" });
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}
