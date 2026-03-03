import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: {
      email: "seed@example.com",
      display_name: "Seed User",
      is_active: true,
    },
  });
  console.log("Upserted user:", user.id, user.email);

  const template = await prisma.taskTemplate.upsert({
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
  });
  console.log("Upserted task template:", template.id, template.task_key);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
