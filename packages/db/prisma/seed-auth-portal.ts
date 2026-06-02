/**
 * Seeds auth users, portal clients/work items. Invoked from prisma/seed.ts.
 */
import {
  AppUserRole,
  ClientSource,
  PortalClientRole,
  PortalWorkPriority,
  PortalWorkStatus,
  PortalWorkType,
  type PrismaClient,
} from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ColumbusDev2026!";

export async function seedAuthAndPortal(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const superEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@columbusai.com").toLowerCase();

  const superAdmin = await prisma.appUser.upsert({
    where: { email: superEmail },
    update: { password_hash: passwordHash, role: AppUserRole.SUPER_ADMIN, status: "ACTIVE" },
    create: {
      email: superEmail,
      password_hash: passwordHash,
      role: AppUserRole.SUPER_ADMIN,
      display_name: "Super Admin",
      status: "ACTIVE",
    },
  });

  const agencyUsers = [
    { email: "levente@columbusai.com", display_name: "LeVente Ortiz", role: AppUserRole.ADMIN },
    { email: "devon@columbusai.com", display_name: "Devon Park", role: AppUserRole.STAFF },
    { email: "maya@columbusai.com", display_name: "Maya Chen", role: AppUserRole.STAFF },
  ];

  const agencyIds: Record<string, string> = {};
  for (const u of agencyUsers) {
    const row = await prisma.appUser.upsert({
      where: { email: u.email },
      update: { password_hash: passwordHash, role: u.role },
      create: { ...u, password_hash: passwordHash, status: "ACTIVE" },
    });
    agencyIds[u.email] = row.id;
  }

  const kira = await prisma.appUser.upsert({
    where: { email: "kira@kdmdermatherapy.com" },
    update: { password_hash: passwordHash, role: AppUserRole.CLIENT },
    create: {
      email: "kira@kdmdermatherapy.com",
      password_hash: passwordHash,
      role: AppUserRole.CLIENT,
      display_name: "Kira D. Morris",
      status: "ACTIVE",
    },
  });

  const clients = [
    { id: "c-kdm", name: "KDM Derma Therapy", industry: "Med Spa / Skin Care" },
    { id: "c-arroyo", name: "Arroyo Dental Studio", industry: "Dentistry" },
    { id: "c-blueline", name: "Blueline Fitness", industry: "Fitness / Wellness" },
  ];

  for (const c of clients) {
    await prisma.portalClient.upsert({
      where: { id: c.id },
      update: { name: c.name, industry: c.industry },
      create: c,
    });
  }

  await prisma.clientUser.upsert({
    where: {
      user_id_client_id_client_source: {
        user_id: kira.id,
        client_id: "c-kdm",
        client_source: ClientSource.PORTAL,
      },
    },
    update: { role: PortalClientRole.OWNER },
    create: {
      user_id: kira.id,
      client_id: "c-kdm",
      client_source: ClientSource.PORTAL,
      role: PortalClientRole.OWNER,
    },
  });

  const workItems = [
    {
      id: "WI-1042",
      client_id: "c-kdm",
      title: "Add a Dermaplaning service page",
      description: "Dedicated page for Dermaplaning with pricing, before/after photos, and a booking CTA.",
      type: PortalWorkType.website,
      status: PortalWorkStatus.in_progress,
      priority: PortalWorkPriority.medium,
      created_by_user_id: kira.id,
      primary_assignee_id: agencyIds["devon@columbusai.com"] ?? null,
      assignee_ids: agencyIds["devon@columbusai.com"] ? [agencyIds["devon@columbusai.com"]] : [],
      watcher_ids: agencyIds["maya@columbusai.com"] ? [agencyIds["maya@columbusai.com"]] : [],
      tags: ["service-page"],
    },
    {
      id: "WI-1037",
      client_id: "c-kdm",
      title: "Booking form not submitting on Safari",
      description: "Reported by a client — the booking form submit button does nothing on Safari iOS 17.",
      type: PortalWorkType.bug,
      status: PortalWorkStatus.in_progress,
      priority: PortalWorkPriority.critical,
      created_by_user_id: kira.id,
      primary_assignee_id: agencyIds["levente@columbusai.com"] ?? null,
      assignee_ids: agencyIds["levente@columbusai.com"]
        ? [agencyIds["levente@columbusai.com"], agencyIds["devon@columbusai.com"]].filter(Boolean)
        : [],
      watcher_ids: [],
      tags: ["safari", "booking"],
    },
  ];

  for (const w of workItems) {
    await prisma.portalWorkItem.upsert({
      where: { id: w.id },
      update: w,
      create: w,
    });
  }

  console.log("Auth seed:", { superAdmin: superAdmin.email, demoPassword: DEMO_PASSWORD });
  console.log("Portal seed: clients", clients.length, "work items", workItems.length);
}
