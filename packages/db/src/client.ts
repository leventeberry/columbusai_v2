import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export { PrismaClient };
export type { PrismaClient as PrismaClientType };

export type PrismaLogLevel = "query" | "info" | "warn" | "error";

export function createPrismaClient(options?: { log?: PrismaLogLevel[] }): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a Prisma client");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      options?.log ??
      (process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]),
  });
}

const globalForPrisma = globalThis as typeof globalThis & {
  __columbusPrisma?: PrismaClient;
};

/** Singleton Prisma client (uses driver adapter per Prisma 7). */
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.__columbusPrisma) {
    globalForPrisma.__columbusPrisma = createPrismaClient();
  }
  return globalForPrisma.__columbusPrisma;
}
