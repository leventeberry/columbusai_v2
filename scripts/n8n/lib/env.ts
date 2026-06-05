import { DEMO_WEBHOOK_PATH_ID } from "./workflows.js";
import { loadEnvFile, N8N_ENV_PROFILE, resolveEnvProfile } from "../../env/load-env-file.js";

export type N8nEnv = {
  apiUrl: string;
  apiKey: string;
  demoWorkflowId?: string;
  followUpWorkflowId?: string;
};

function assertDemoWorkflowIdNotWebhookPath(workflowId: string): void {
  if (workflowId === DEMO_WEBHOOK_PATH_ID) {
    console.error(
      "N8N_DEMO_WORKFLOW_ID is set to the webhook path UUID, not the workflow id.",
    );
    console.error(
      `Use the workflow id from pnpm n8n:list (e.g. gEEYTVQe39iBRra3), not ${DEMO_WEBHOOK_PATH_ID}.`,
    );
    process.exit(1);
  }
}

function requireVar(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    if (name === "N8N_API_KEY") {
      console.error("");
      console.error("Copy .env.local.example → .env.local, then:");
      console.error("  1. Open http://localhost:5678 (Docker n8n)");
      console.error("  2. Settings → n8n API → Create an API key");
      console.error("  3. Set N8N_API_URL and N8N_API_KEY in .env.local");
      console.error("");
      console.error("Production sync: COLUMBUS_ENV=production pnpm n8n:list (uses .env.production).");
      console.error("See docs/architecture/n8n-local-dev.md");
    }
    process.exit(1);
  }
  return value;
}

/** Load repo-root env file for n8n CLI (default .env.local; override with COLUMBUS_ENV). */
export function loadEnvFiles(): void {
  const profile = process.env.COLUMBUS_ENV?.trim() ? resolveEnvProfile() : N8N_ENV_PROFILE;
  loadEnvFile(profile);
}

export type LoadN8nEnvOptions = {
  requireDemoWorkflowId?: boolean;
  requireFollowUpWorkflowId?: boolean;
};

/** Load env files and return normalized n8n API settings. */
export function loadN8nEnv(options?: LoadN8nEnvOptions): N8nEnv {
  loadEnvFiles();

  const apiUrl = requireVar("N8N_API_URL").replace(/\/+$/, "");
  const apiKey = requireVar("N8N_API_KEY");

  if (apiUrl.includes("n8n.columbusai.tech")) {
    console.warn(
      "Warning: N8N_API_URL points at production. For local workflow dev, use .env.local (N8N_API_URL=http://localhost:5678)",
    );
  }

  const demoWorkflowId = process.env.N8N_DEMO_WORKFLOW_ID?.trim();
  if (options?.requireDemoWorkflowId && !demoWorkflowId) {
    console.error("Missing required env var: N8N_DEMO_WORKFLOW_ID");
    process.exit(1);
  }
  if (demoWorkflowId) {
    assertDemoWorkflowIdNotWebhookPath(demoWorkflowId);
  }

  const followUpWorkflowId = process.env.N8N_DEMO_FOLLOWUP_WORKFLOW_ID?.trim();
  if (options?.requireFollowUpWorkflowId && !followUpWorkflowId) {
    console.error("Missing required env var: N8N_DEMO_FOLLOWUP_WORKFLOW_ID");
    process.exit(1);
  }

  return { apiUrl, apiKey, demoWorkflowId, followUpWorkflowId };
}
