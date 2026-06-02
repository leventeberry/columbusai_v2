#!/usr/bin/env tsx
/**
 * Verify .env.*.example files share the same keys in the same order.
 */
import fs from "node:fs";
import path from "node:path";
import { PROFILE_FILES, type EnvProfile } from "../../env/profiles.js";

const repoRoot = path.resolve(import.meta.dirname, "../..");

function parseKeys(filePath: string): string[] {
  const text = fs.readFileSync(filePath, "utf8");
  const keys: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    keys.push(trimmed.slice(0, eq));
  }
  return keys;
}

function main(): void {
  const profiles = Object.keys(PROFILE_FILES) as EnvProfile[];
  const byProfile = new Map<EnvProfile, string[]>();

  for (const profile of profiles) {
    const filePath = path.join(repoRoot, PROFILE_FILES[profile]);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing ${PROFILE_FILES[profile]} — run pnpm env:sync-examples`);
      process.exit(1);
    }
    byProfile.set(profile, parseKeys(filePath));
  }

  const [first, ...rest] = profiles;
  const expected = byProfile.get(first)!;
  let failed = false;

  for (const profile of rest) {
    const keys = byProfile.get(profile)!;
    if (keys.length !== expected.length) {
      console.error(`${PROFILE_FILES[profile]}: ${keys.length} keys, expected ${expected.length}`);
      failed = true;
      continue;
    }
    for (let i = 0; i < expected.length; i++) {
      if (keys[i] !== expected[i]) {
        console.error(
          `Key mismatch at index ${i}: ${PROFILE_FILES[first]} has ${expected[i]}, ${PROFILE_FILES[profile]} has ${keys[i]}`,
        );
        failed = true;
        break;
      }
    }
  }

  if (failed) process.exit(1);
  console.log(`OK: ${expected.length} keys match across ${profiles.join(", ")}`);
}

main();
