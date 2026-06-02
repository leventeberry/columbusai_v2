import { execSync } from "node:child_process";
import { assertHostingerApiAuth } from "./lib/auth";
import { createApis, createHostingerConfig } from "./lib/client";
import { deployDockerProject } from "./lib/deploy";
import { loadHostingerEnv, readSshPublicKey } from "./lib/env";
import { provisionDns } from "./lib/dns";
import { provisionFirewall } from "./lib/firewall";
import { provisionSshKey } from "./lib/ssh-key";
import {
  assertDockerOsTemplate,
  getVirtualMachine,
  resolveVirtualMachineId,
} from "./lib/vm";

function isDockerManagerUnsupported(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("2044") ||
    message.toLowerCase().includes("does not support docker manager")
  );
}

function printSshDeployInstructions(env: ReturnType<typeof loadHostingerEnv>): void {
  const repoDir = "/opt/columbusai_v2";
  console.log(`
Docker Manager is not available on this VPS OS template (Ubuntu needs SSH + Compose).

Run these commands from your laptop (with SSH access to ${env.vpsIp}):

  # 1) Bootstrap Docker on the VPS (once)
  ssh root@${env.vpsIp} 'bash -s' < infra/scripts/vps-bootstrap.sh

  # 2) Copy repo + .env
  rsync -az --exclude node_modules --exclude .git ./ root@${env.vpsIp}:${repoDir}/
  scp .env root@${env.vpsIp}:${repoDir}/.env

  # 3) Start production stack
  ssh root@${env.vpsIp} 'cd ${repoDir} && docker compose -f infra/docker/compose.prod.yml up -d --build'

  # 4) Push demo workflow (after n8n is up)
  # Set N8N_API_URL=https://n8n.columbusai.tech and N8N_API_KEY in .env first
  npm run n8n:push:demo && npm run n8n:activate:demo

  # 5) Verify
  curl -sf https://api.columbusai.tech/api/health
`);
}

async function trySshDeploy(env: ReturnType<typeof loadHostingerEnv>): boolean {
  try {
    execSync(
      `ssh -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new root@${env.vpsIp} echo SSH_OK`,
      { stdio: "pipe" }
    );
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const env = loadHostingerEnv();
  console.log("==> Checking Hostinger API token");
  await assertHostingerApiAuth(env);

  const config = createHostingerConfig(env);
  const apis = createApis(config);
  const vmId = await resolveVirtualMachineId(apis.vms, env.vpsIp);
  const vm = await getVirtualMachine(apis.vms, vmId);
  console.log(
    `==> Target VM ${vmId} (${env.vpsIp}) state=${vm.state} template=${vm.template?.name ?? "-"}`
  );

  console.log("==> Provision firewall, SSH key, DNS");
  await provisionFirewall(apis.firewall, apis.actions, vmId, env.firewallName);
  await provisionSshKey(
    apis.publicKeys,
    apis.vms,
    apis.actions,
    vmId,
    env.sshPublicKeyPath,
    readSshPublicKey(env.sshPublicKeyPath)
  );
  await provisionDns(apis.dns, env.domain, env.vpsIp);

  console.log("==> Deploy via Hostinger Docker Manager");
  assertDockerOsTemplate(vm);
  try {
    await deployDockerProject(
      apis.docker,
      apis.actions,
      vmId,
      env.dockerProjectName,
      env.githubComposeUrl
    );
    console.log("\nDeploy complete (Docker Manager).");
    console.log("  npm run hostinger:deploy -- --status");
    return;
  } catch (err) {
    if (!isDockerManagerUnsupported(err)) {
      throw err;
    }
    console.warn("\nDocker Manager not supported on this VPS template.");
  }

  if (trySshDeploy(env)) {
    console.log("SSH is reachable — run the manual steps below.");
  } else {
    console.log(
      "SSH to port 22 timed out from this machine. Try from your laptop after DNS/firewall propagate."
    );
  }
  printSshDeployInstructions(env);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
