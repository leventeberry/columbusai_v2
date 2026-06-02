import type { Request, Response, NextFunction } from "express";

/**
 * Protects admin sales routes. Set ADMIN_API_TOKEN in API env; admin server sends X-Admin-Token.
 */
export function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected) {
    console.error("[adminAuth] ADMIN_API_TOKEN is not set");
    res.status(503).json({ error: "Admin API not configured" });
    return;
  }
  const provided =
    req.headers["x-admin-token"] ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (typeof provided !== "string" || provided !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
