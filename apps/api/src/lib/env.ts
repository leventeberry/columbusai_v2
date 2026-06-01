/**
 * Validated API env. Validates once at startup; never log secret values.
 */
import { z } from "zod";

const DEFAULT_CORS_ORIGIN = "http://localhost:3000,http://127.0.0.1:3000";

function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

const portSchema = z
  .string()
  .optional()
  .transform((s) => (s ? parseInt(s, 10) : undefined))
  .refine((n) => n === undefined || (Number.isInteger(n) && n >= 1 && n <= 65535), {
    message: "PORT must be an integer between 1 and 65535",
  });

export interface ApiEnv {
  databaseUrl: string;
  openaiApiKey: string;
  corsOrigins: string[];
  port: number;
  redisUrl: string | null;
  vectorDatabaseUrl: string | null;
}

let cached: ApiEnv | null = null;

export function getApiEnv(): ApiEnv {
  
  if (cached) return cached;

  // TODO: remove this once we have a production environment
  const isProd = process.env.NODE_ENV === "production";

  // Required always
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error(
      "[env] Missing required env: DATABASE_URL. Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname"
    );
    process.exit(1);
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey || openaiApiKey.trim() === "") {
    console.error(
      "[env] Missing required env: OPENAI_API_KEY. Set it to your OpenAI API key (never log the value)."
    );
    process.exit(1);
  }

  // PORT (optional, validated if present)
  const portResult = portSchema.safeParse(process.env.PORT);
  if (!portResult.success) {
    console.error("[env] Invalid PORT:", portResult.error.message);
    process.exit(1);
  }
  const port = portResult.data ?? 4000;

  // CORS: required in production and must not be default localhost list
  const corsRaw = process.env.CORS_ORIGIN?.trim() ?? "";
  if (isProd) {
    if (!corsRaw || parseCorsOrigins(corsRaw).length === 0) {
      console.error(
        "[env] In production CORS_ORIGIN is required. Example: CORS_ORIGIN=https://app.example.com"
      );
      process.exit(1);
    }
    const normalized = parseCorsOrigins(corsRaw).join(",");
    const defaultNormalized = parseCorsOrigins(DEFAULT_CORS_ORIGIN).join(",");
    if (normalized === defaultNormalized || corsRaw === DEFAULT_CORS_ORIGIN) {
      console.error(
        "[env] In production CORS_ORIGIN must not be the default localhost list. Example: CORS_ORIGIN=https://app.example.com"
      );
      process.exit(1);
    }
  }

  const corsOrigins =
    corsRaw.length > 0 ? parseCorsOrigins(corsRaw) : parseCorsOrigins(DEFAULT_CORS_ORIGIN);

  // Optional: REDIS_URL (warn in prod if absent)
  const redisUrl = process.env.REDIS_URL?.trim() ?? null;
  if (redisUrl === "") {
    console.error("[env] REDIS_URL must be non-empty when set. Example: REDIS_URL=redis://localhost:6379");
    process.exit(1);
  }
  if (isProd && !redisUrl) {
    console.warn("[env] REDIS_URL is unset; rate limiting is disabled.");
  }

  // Optional: VECTOR_DATABASE_URL (warn in prod if absent)
  const vectorDatabaseUrl = process.env.VECTOR_DATABASE_URL?.trim() ?? null;
  if (process.env.VECTOR_DATABASE_URL !== undefined && vectorDatabaseUrl === "") {
    console.error(
      "[env] VECTOR_DATABASE_URL must be non-empty when set. Example: VECTOR_DATABASE_URL=postgresql://..."
    );
    process.exit(1);
  }
  if (isProd && !vectorDatabaseUrl) {
    console.warn("[env] VECTOR_DATABASE_URL is unset; RAG/vector retrieval is disabled.");
  }

  cached = {
    databaseUrl,
    openaiApiKey,
    corsOrigins,
    port,
    redisUrl: redisUrl || null,
    vectorDatabaseUrl: vectorDatabaseUrl || null,
  };
  return cached;
}
