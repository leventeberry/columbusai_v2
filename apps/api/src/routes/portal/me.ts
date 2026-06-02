import type { Response } from "express";
import { ClientSource } from "@columbusai/db";
import { prisma } from "../../lib/prisma.js";
import { serializeMe } from "../../lib/auth/serialize.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";
import { isAgencyRole } from "../../lib/portal/repository.js";

function initials(displayName: string | null, email: string): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export async function getPortalMe(req: RequestWithAuth, res: Response): Promise<void> {
  const user = req.auth!.user;
  const memberships = await prisma.clientUser.findMany({
    where: { user_id: user.id, client_source: ClientSource.PORTAL },
    select: { client_id: true, client_source: true, role: true },
  });

  const isAgency = isAgencyRole(user.role);
  const membershipClientIds = memberships.map((m) => m.client_id);

  const portalClients = isAgency
    ? await prisma.portalClient.findMany({ orderBy: { name: "asc" } })
    : membershipClientIds.length > 0
      ? await prisma.portalClient.findMany({
          where: { id: { in: membershipClientIds } },
          orderBy: { name: "asc" },
        })
      : [];

  const rosterUsers = await prisma.appUser.findMany({
    where: isAgency
      ? {
          OR: [
            { role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF", "VIEWER"] } },
            {
              client_memberships: {
                some: { client_source: ClientSource.PORTAL },
              },
            },
          ],
        }
      : {
          client_memberships: {
            some: {
              client_source: ClientSource.PORTAL,
              client_id: { in: membershipClientIds.length ? membershipClientIds : ["__none__"] },
            },
          },
        },
    select: {
      id: true,
      email: true,
      display_name: true,
      role: true,
    },
  });

  const activeClientId = isAgency
    ? (portalClients[0]?.id ?? null)
    : (membershipClientIds[0] ?? null);

  res.json({
    ...serializeMe(user, memberships),
    portal: {
      isAgency,
      clients: portalClients.map((c) => ({ id: c.id, name: c.name, industry: c.industry })),
      activeClientId,
      roster: rosterUsers.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        initials: initials(u.display_name, u.email),
        kind: isAgencyRole(u.role) ? ("agency" as const) : ("client" as const),
      })),
    },
  });
}
