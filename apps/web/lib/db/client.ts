import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let initPromise: Promise<void> | null = null;

const CREATE_LEADS_TABLE = `
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY,
  fname text NOT NULL,
  lname text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text NOT NULL,
  role text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  team_size text NOT NULL DEFAULT '',
  what_automate text NOT NULL,
  budget text NOT NULL DEFAULT '',
  timeline text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

/**
 * Returns a Postgres pool and ensures the leads table exists (once per process).
 * Call only when DATABASE_URL is set.
 */
export async function getPool(): Promise<pg.Pool> {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    pool = new Pool({ connectionString: url });
  }
  if (!initPromise) {
    initPromise = (async () => {
      const client = await pool!.connect();
      try {
        await client.query(CREATE_LEADS_TABLE);
      } finally {
        client.release();
      }
    })();
  }
  await initPromise;
  return pool;
}
