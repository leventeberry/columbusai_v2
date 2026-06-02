import type { Response } from "express";
import { routeParam } from "../../lib/route-params.js";
import { z } from "zod";
import { AppUserRole } from "@columbusai/db";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { mapUserRoleToAppRoles } from "../../lib/auth/session.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

const inviteSchema = z.object({
  email: z.string().email().max(255),
  display_name: z.string().min(1).max(120),
  password: z.string().min(8).max(72),
  role: z.enum(["admin", "member", "viewer"]),
});

const roleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

function appRoleToDb(role: "admin" | "member" | "viewer"): AppUserRole {
  if (role === "admin") return AppUserRole.ADMIN;
  if (role === "member") return AppUserRole.STAFF;
  return AppUserRole.VIEWER;
}

function serializeTeamUser(u: {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  created_at: Date;
  role: AppUserRole;
}) {
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    job_title: u.job_title,
    created_at: u.created_at.toISOString(),
    roles: mapUserRoleToAppRoles(u.role),
  };
}

export async function getAdminUsers(req: RequestWithAuth, res: Response): Promise<void> {
  const users = await prisma.appUser.findMany({
    where: { role: { in: [AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN, AppUserRole.STAFF, AppUserRole.VIEWER] } },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      email: true,
      display_name: true,
      avatar_url: true,
      job_title: true,
      created_at: true,
      role: true,
    },
  });
  res.json({ users: users.map(serializeTeamUser) });
}

export async function postAdminUsers(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "User already exists" });
    return;
  }
  const user = await prisma.appUser.create({
    data: {
      email,
      display_name: parsed.data.display_name,
      password_hash: await hashPassword(parsed.data.password),
      role: appRoleToDb(parsed.data.role),
      status: "ACTIVE",
    },
  });
  res.status(201).json({ id: user.id });
}

export async function patchAdminUserRole(req: RequestWithAuth, res: Response): Promise<void> {
  const userId = routeParam(req.params.id);
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success || !userId) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const target = await prisma.appUser.findUnique({ where: { id: userId } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const newRole = appRoleToDb(parsed.data.role);
  if (
    req.auth!.user.id === userId &&
    newRole !== AppUserRole.ADMIN &&
    newRole !== AppUserRole.SUPER_ADMIN
  ) {
    const adminCount = await prisma.appUser.count({
      where: { role: { in: [AppUserRole.ADMIN, AppUserRole.SUPER_ADMIN] } },
    });
    if (adminCount <= 1) {
      res.status(400).json({ error: "Cannot demote the last admin." });
      return;
    }
  }

  await prisma.appUser.update({
    where: { id: userId },
    data: { role: newRole },
  });
  res.json({ ok: true });
}

export async function deleteAdminUser(req: RequestWithAuth, res: Response): Promise<void> {
  const userId = routeParam(req.params.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  if (req.auth!.user.id === userId) {
    res.status(400).json({ error: "You cannot remove yourself." });
    return;
  }
  await prisma.appUser.delete({ where: { id: userId } });
  res.json({ ok: true });
}
