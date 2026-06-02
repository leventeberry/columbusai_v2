import fs from "node:fs";
import { buildDockerEnvironmentString } from "./lib/docker-env";
import { loadHostingerEnv, readSshPublicKey } from "./lib/env";

async function main() {
  const env = loadHostingerEnv();
  readSshPublicKey(env.sshPublicKeyPath);

  const dockerEnv = buildDockerEnvironmentString();
  const lines = dockerEnv.split("\n").filter(Boolean);

  console.log("Hostinger automation preflight OK:");
  console.log(`  VPS IP: ${env.vpsIp}`);
  console.log(`  Domain: ${env.domain}`);
  console.log(`  SSH key: ${env.sshPublicKeyPath}`);
  console.log(`  Docker project: ${env.dockerProjectName}`);
  console.log(`  Compose URL: ${env.githubComposeUrl}`);
  console.log(`  Docker env vars: ${lines.length} (${dockerEnv.length} bytes)`);

  if (!fs.existsSync("docker-compose.yml")) {
    console.error("Missing docker-compose.yml at repo root");
    process.exit(1);
  }
  if (!fs.existsSync("infra/docker/compose.prod.yml")) {
    console.error("Missing infra/docker/compose.prod.yml");
    process.exit(1);
  }

  console.log("\nNext: npm run hostinger:provision && npm run hostinger:deploy");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
