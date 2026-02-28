/**
 * Runs once when the Node server starts, before app code.
 * Default DATABASE_URL in development so npm run dev works without editing .env
 * (Postgres must be running, e.g. docker compose up -d postgres postgres-vectors).
 */
export async function register() {
  if (
    process.env.NODE_ENV === "development" &&
    (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "")
  ) {
    process.env.DATABASE_URL =
      "postgresql://columbus:columbus@localhost:5432/columbus";
  }
}
