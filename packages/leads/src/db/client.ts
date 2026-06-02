/**
 * @deprecated Demo leads are stored via Prisma in sales.leads. File fallback only when DATABASE_URL is unset.
 */
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export async function getPool(): Promise<pg.Pool> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (!pool) {
    pool = new Pool({ connectionString: url });
  }
  return pool;
}
