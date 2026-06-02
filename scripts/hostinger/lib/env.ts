import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { config as loadEnv } from "dotenv";

export const DEFAULT_VPS_IP = "147.93.113.58";
export const DEFAULT_DOMAIN = "columbusai.tech";
export const DEFAULT_FIREWALL_NAME = "columbusai-prod";
export const DEFAULT_DOCKER_PROJECT = "columbusai-prod";
export const DEFAULT_GITHUB_COMPOSE_URL =
  "https://github.com/leventeberry/columbusai_v2";

export type HostingerEnv = {
  apiToken: string;
  vpsIp: string;
  domain: string;
  sshPublicKeyPath: string;
  githubComposeUrl: string;
  dockerProjectName: string;
  firewallName: string;
};

function requireVar(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function expandHome(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

function normalizeApiToken(raw: string): string {
  let token = raw.trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  if (token === "test" || token === "change-me") {
    console.error(
      "HOSTINGER_API_TOKEN is still a placeholder. Set a real token from hPanel."
    );
    process.exit(1);
  }
  if (token.length < 32) {
    console.error(
      `HOSTINGER_API_TOKEN looks too short (${token.length} chars). Copy the full token from hPanel.`
    );
    process.exit(1);
  }
  return token;
}

/** Load repo-root .env and return Hostinger automation settings. */
export function loadHostingerEnv(): HostingerEnv {
  loadEnv({ path: path.join(process.cwd(), ".env") });

  return {
    apiToken: normalizeApiToken(requireVar("HOSTINGER_API_TOKEN")),
    vpsIp: process.env.HOSTINGER_VPS_IP?.trim() || DEFAULT_VPS_IP,
    domain: process.env.HOSTINGER_DOMAIN?.trim() || DEFAULT_DOMAIN,
    sshPublicKeyPath: expandHome(
      process.env.HOSTINGER_SSH_PUBLIC_KEY_PATH?.trim() ||
        "~/.ssh/id_ed25519.pub"
    ),
    githubComposeUrl:
      process.env.HOSTINGER_GITHUB_COMPOSE_URL?.trim() ||
      DEFAULT_GITHUB_COMPOSE_URL,
    dockerProjectName:
      process.env.HOSTINGER_DOCKER_PROJECT_NAME?.trim() ||
      DEFAULT_DOCKER_PROJECT,
    firewallName:
      process.env.HOSTINGER_FIREWALL_NAME?.trim() || DEFAULT_FIREWALL_NAME,
  };
}

export function readSshPublicKey(filePath: string): string {
  const resolved = expandHome(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`SSH public key not found: ${resolved}`);
    process.exit(1);
  }
  const key = fs.readFileSync(resolved, "utf8").trim();
  if (!key.startsWith("ssh-")) {
    console.error(`Invalid SSH public key format in ${resolved}`);
    process.exit(1);
  }
  return key;
}
