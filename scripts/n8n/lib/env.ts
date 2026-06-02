import path from "node:path";
import { config as loadEnv } from "dotenv";

/** Webhook path UUID from demo-request workflow — not the workflow id. */
export const DEMO_WEBHOOK_PATH_ID = "f7ceff32-3922-4ac8-a522-2b83995e5f04";

export type N8nEnv = {
  apiUrl: string;
  apiKey: string;
  demoWorkflowId?: string;
};

function assertDemoWorkflowIdNotWebhookPath(workflowId: string): void {
  if (workflowId === DEMO_WEBHOOK_PATH_ID) {
    console.error(
      "N8N_DEMO_WORKFLOW_ID is set to the webhook path UUID, not the workflow id."
    );
    console.error(
      `Use the workflow id from npm run n8n:list (e.g. gEEYTVQe39iBRra3), not ${DEMO_WEBHOOK_PATH_ID}.`
    );
    process.exit(1);
  }
}

function requireVar(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

/** Load repo-root .env and return normalized n8n API settings. */
export function loadN8nEnv(options?: { requireDemoWorkflowId?: boolean }): N8nEnv {
  const cwd = process.cwd();
  loadEnv({ path: path.join(cwd, ".env") });

  const apiUrl = requireVar("N8N_API_URL").replace(/\/+$/, "");
  const apiKey = requireVar("N8N_API_KEY");

  const demoWorkflowId = process.env.N8N_DEMO_WORKFLOW_ID?.trim();
  if (options?.requireDemoWorkflowId && !demoWorkflowId) {
    console.error("Missing required env var: N8N_DEMO_WORKFLOW_ID");
    process.exit(1);
  }
  if (demoWorkflowId) {
    assertDemoWorkflowIdNotWebhookPath(demoWorkflowId);
  }

  return { apiUrl, apiKey, demoWorkflowId };
}
