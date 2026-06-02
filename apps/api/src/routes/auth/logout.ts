import type { Request, Response } from "express";
import { clearSessionCookie, revokeSessionByToken } from "../../lib/auth/session.js";

export async function postAuthLogout(req: Request, res: Response): Promise<void> {
  await revokeSessionByToken(req);
  clearSessionCookie(res);
  res.json({ ok: true });
}
