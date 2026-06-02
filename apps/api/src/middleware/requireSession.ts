import type { Request, Response, NextFunction } from "express";
import { resolveSession, type SessionContext } from "../lib/auth/session.js";

export type RequestWithAuth = Request & { auth?: SessionContext };

export async function requireSession(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ctx = await resolveSession(req);
    if (!ctx) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.auth = ctx;
    next();
  } catch (err) {
    next(err);
  }
}
