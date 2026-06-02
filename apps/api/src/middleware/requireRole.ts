import type { Response, NextFunction } from "express";
import type { AppUserRole } from "@columbusai/db";
import type { RequestWithAuth } from "./requireSession.js";

export function requireRole(...allowed: AppUserRole[]) {
  return (req: RequestWithAuth, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowed.includes(req.auth.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
