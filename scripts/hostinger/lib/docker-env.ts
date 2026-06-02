import path from "node:path";
import { config as loadEnv } from "dotenv";

/** Keys passed to Hostinger Docker Manager `environment` (max ~8KB total). */
export const DOCKER_ENV_ALLOWLIST = [
  "DOMAIN",
  "ACME_EMAIL",
  "POSTGRES_PASSWORD",
  "CORS_ORIGIN",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_STORE",
  "OPENAI_EMBED_MODEL",
  "BOOKING_LINK",
  "VITE_API_URL",
  "VITE_CONTACT_EMAIL",
  "VITE_BOOKING_LINK",
  "VITE_CHAT_TITLE",
  "VITE_CHAT_WELCOME",
  "SESSION_SECRET",
  "SEED_ADMIN_EMAIL",
  "ADMIN_API_TOKEN",
  "N8N_BASIC_AUTH_ACTIVE",
  "N8N_BASIC_AUTH_USER",
  "N8N_BASIC_AUTH_PASSWORD",
  "GENERIC_TIMEZONE",
  "NEXT_PUBLIC_API_URL",
  "RATE_LIMIT_SCOPE",
  "RATE_LIMIT_MAX_REQUESTS",
  "RATE_LIMIT_WINDOW_SECONDS",
  "RETRIEVAL_K",
] as const;

const MAX_ENV_BYTES = 8192;

export function buildDockerEnvironmentString(): string {
  loadEnv({ path: path.join(process.cwd(), ".env") });

  const lines: string[] = [];
  for (const key of DOCKER_ENV_ALLOWLIST) {
    const value = process.env[key]?.trim();
    if (value) {
      lines.push(`${key}=${value}`);
    }
  }

  const body = lines.join("\n");
  if (body.length > MAX_ENV_BYTES) {
    throw new Error(
      `Docker environment string is ${body.length} bytes (max ${MAX_ENV_BYTES}). Remove unused keys from .env or shorten values.`
    );
  }
  if (!process.env.POSTGRES_PASSWORD?.trim()) {
    console.warn("Warning: POSTGRES_PASSWORD not set in .env");
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.warn("Warning: OPENAI_API_KEY not set in .env");
  }
  return body;
}
