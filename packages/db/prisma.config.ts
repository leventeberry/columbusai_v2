import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(packageRoot, "../..");

// Prisma 7 does not load .env automatically — use COLUMBUS_ENV=local|staging|production (default local).
const columbusEnv = process.env.COLUMBUS_ENV?.trim().toLowerCase();
const envFile =
  columbusEnv === "production"
    ? ".env.production"
    : columbusEnv === "staging"
      ? ".env.staging"
      : ".env.local";
dotenv.config({ path: path.join(repoRoot, envFile) });

export default defineConfig({
  // Multi-file schema directory (not a single schema.prisma path).
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
