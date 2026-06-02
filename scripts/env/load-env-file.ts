import path from "node:path";
import { config as loadEnv } from "dotenv";
import { LIVE_FILES, type EnvProfile } from "../../env/profiles.js";

const repoRoot = process.cwd();

/** Resolve which live env file to load (override with COLUMBUS_ENV=local|staging|production). */
export function resolveEnvProfile(): EnvProfile {
  const raw = process.env.COLUMBUS_ENV?.trim().toLowerCase();
  if (raw === "local" || raw === "staging" || raw === "production") return raw;
  if (raw) {
    console.warn(`Unknown COLUMBUS_ENV=${raw}, defaulting to production`);
  }
  return "production";
}

export function envFilePath(profile: EnvProfile): string {
  return path.join(repoRoot, LIVE_FILES[profile]);
}

/** Load a single repo-root env file (no merge). File values win over pre-set shell env. */
export function loadEnvFile(profile: EnvProfile): void {
  loadEnv({ path: envFilePath(profile), override: true });
}

/** Profile used by n8n CLI scripts on a developer laptop. */
export const N8N_ENV_PROFILE: EnvProfile = "local";
