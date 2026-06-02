import { assertHostingerApiAuth } from "./lib/auth";
import { loadHostingerEnv } from "./lib/env";

async function main() {
  const env = loadHostingerEnv();
  await assertHostingerApiAuth(env);
  console.log("Hostinger API token is valid.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
