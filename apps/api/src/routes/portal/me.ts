import type { Response } from "express";
import { ClientSource } from "@columbusai/db";
import { prisma } from "../../lib/prisma.js";
import { serializeMe } from "../../lib/auth/serialize.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

export async function getPortalMe(req: RequestWithAuth, res: Response): Promise<void> {
  const user = req.auth!.user;
  const memberships = await prisma.clientUser.findMany({
    where: { user_id: user.id, client_source: ClientSource.PORTAL },
    select: { client_id: true, client_source: true, role: true },
  });

  const clientIds = memberships.map((m) => m.client_id);
  const clients =
    clientIds.length > 0
      ? await prisma.portalClient.findMany({ where: { id: { in: clientIds } } })
      : [];

  const isAgency = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "STAFF";

  res.json({
    ...serializeMe(user, memberships),
    portal: {
      isAgency,
      clients: clients.map((c) => ({ id: c.id, name: c.name, industry: c.industry })),
      activeClientId: clientIds[0] ?? null,
    },
  });
}
