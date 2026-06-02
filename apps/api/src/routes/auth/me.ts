import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { serializeMe } from "../../lib/auth/serialize.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

export async function getAuthMe(req: RequestWithAuth, res: Response): Promise<void> {
  const user = req.auth!.user;
  const memberships = await prisma.clientUser.findMany({
    where: { user_id: user.id },
    select: { client_id: true, client_source: true, role: true },
  });
  res.json(serializeMe(user, memberships));
}
