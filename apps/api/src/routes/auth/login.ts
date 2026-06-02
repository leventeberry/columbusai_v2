import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/auth/password.js";
import { createSession, setSessionCookie } from "../../lib/auth/session.js";
import { serializeMe } from "../../lib/auth/serialize.js";

const bodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export async function postAuthLogin(req: Request, res: Response): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.appUser.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await verifyPassword(parsed.data.password, user.password_hash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const { token } = await createSession(user.id, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  setSessionCookie(res, token);

  const memberships = await prisma.clientUser.findMany({
    where: { user_id: user.id },
    select: { client_id: true, client_source: true, role: true },
  });

  res.json({
    ...serializeMe(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        job_title: user.job_title,
      },
      memberships,
    ),
    sessionToken: token,
  });
}
