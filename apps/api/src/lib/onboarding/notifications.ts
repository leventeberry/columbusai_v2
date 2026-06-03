import { AppUserRole } from "@columbusai/db";
import { prisma } from "../prisma.js";

export async function createPortalNotification(input: {
  userId: string;
  kind: string;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  await prisma.portalNotification.create({
    data: {
      user_id: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    },
  });
}

export async function notifyAgencyStaff(input: {
  kind: string;
  title: string;
  body?: string;
  href?: string;
  excludeUserId?: string;
}): Promise<void> {
  const staff = await prisma.appUser.findMany({
    where: {
      role: { in: [AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN, AppUserRole.STAFF] },
      status: "ACTIVE",
      ...(input.excludeUserId ? { id: { not: input.excludeUserId } } : {}),
    },
    select: { id: true },
    take: 10,
  });

  await Promise.all(
    staff.map((u) =>
      createPortalNotification({
        userId: u.id,
        kind: input.kind,
        title: input.title,
        body: input.body,
        href: input.href,
      }),
    ),
  );
}
