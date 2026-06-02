#!/usr/bin/env tsx
/**
 * Regenerate .env.local.example, .env.staging.example, .env.production.example from env/profiles.ts
 */
import fs from "node:fs";
import path from "node:path";
import { ENV_KEYS, LIVE_FILES, PROFILE_FILES, type EnvProfile } from "../../env/profiles.js";

const repoRoot = path.resolve(import.meta.dirname, "../..");

function formatValue(value: string): string {
  if (value === "") return "";
  if (/[\s#"'`]/.test(value)) return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return value;
}

function renderProfile(profile: EnvProfile): string {
  const compose =
    profile === "local" ? "compose.dev.yml" : profile === "production" ? "compose.prod.yml" : "compose.staging.yml";
  const live = LIVE_FILES[profile];
  const lines: string[] = [
    `# Columbus AI — ${profile} environment template`,
    `# Copy: cp ${PROFILE_FILES[profile]} ${live}`,
    `# Docker: docker compose --env-file ${live} -f infra/docker/${compose} ...`,
    `# Compose service blocks may override DATABASE_URL, internal webhooks, etc.`,
    "",
  ];

  for (const def of ENV_KEYS) {
    if (def.comment) lines.push(`# ${def.comment}`);
    const raw = def.values[profile];
    lines.push(raw === "" ? `${def.key}=` : `${def.key}=${formatValue(raw)}`);
    lines.push("");
  }

  return lines.join("\n").replace(/\n+$/, "\n");
}

function main(): void {
  for (const profile of Object.keys(PROFILE_FILES) as EnvProfile[]) {
    const fileName = PROFILE_FILES[profile];
    const outPath = path.join(repoRoot, fileName);
    fs.writeFileSync(outPath, renderProfile(profile), "utf8");
    console.log(`Wrote ${fileName}`);
  }
}

main();
