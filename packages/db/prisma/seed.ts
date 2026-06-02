import { getPrismaClient } from "../src/client.js";
import { seedAuthAndPortal } from "./seed-auth-portal.js";

const prisma = getPrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.user.upsert({
      where: { email: "seed@example.com" },
      update: {},
      create: {
        email: "seed@example.com",
        display_name: "Seed User",
        is_active: true,
      },
    }),
    prisma.taskTemplate.upsert({
      where: { task_key: "default_followup" },
      update: {},
      create: {
        name: "Default follow-up",
        task_key: "default_followup",
        task_type: "follow-up",
        channel: "email",
        stage_trigger_type: "on_enter",
        offset_type: "on_trigger",
        offset_value: 0,
        offset_unit: "days",
        is_active: true,
      },
    }),
  ]).then(([user, template]) => {
    console.log("Upserted automation user:", user.id, user.email);
    console.log("Upserted task template:", template.id, template.task_key);
  });

  await seedAuthAndPortal(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
