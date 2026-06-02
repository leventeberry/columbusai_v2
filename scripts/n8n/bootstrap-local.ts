/**
 * Push demo + follow-up workflows to local Docker n8n and activate them.
 * Requires .env.local with N8N_API_URL=http://localhost:5678 and N8N_API_KEY.
 */
import fs from "node:fs";
import {
  createWorkflow,
  n8nRequest,
  type N8nWorkflow,
  updateWorkflow,
} from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import { assertWorkflowIdMatch, sanitizeForPush } from "./lib/workflow-payload";
import {
  getWorkflowConfig,
  type WorkflowKey,
  workflowFilePath,
} from "./lib/workflows";

async function upsertWorkflow(
  env: ReturnType<typeof loadN8nEnv>,
  key: WorkflowKey,
): Promise<string> {
  const config = getWorkflowConfig(key);
  const existingId =
    key === "demo" ? env.demoWorkflowId : env.followUpWorkflowId;
  const workflowPath = workflowFilePath(config);

  if (!fs.existsSync(workflowPath)) {
    throw new Error(`Missing ${workflowPath}`);
  }

  const workflow = JSON.parse(fs.readFileSync(workflowPath, "utf8")) as N8nWorkflow;
  const body = sanitizeForPush(workflow);

  if (existingId) {
    assertWorkflowIdMatch(workflow, existingId, config.envVar);
    await updateWorkflow(env, existingId, body);
    await n8nRequest(env, "POST", `/api/v1/workflows/${existingId}/activate`, {});
    console.log(`Updated + activated ${config.label} (${existingId})`);
    return existingId;
  }

  const created = await createWorkflow(env, body);
  const id = String(created.id ?? "");
  if (!id) {
    throw new Error(`Create ${config.label} did not return an id`);
  }
  await n8nRequest(env, "POST", `/api/v1/workflows/${id}/activate`, {});
  console.log(`Created + activated ${config.label} (${id})`);
  return id;
}

async function main() {
  const env = loadN8nEnv();
  if (!env.apiUrl.includes("localhost") && !env.apiUrl.includes("127.0.0.1")) {
    console.error(
      `Refusing bootstrap: N8N_API_URL is ${env.apiUrl} (expected local Docker n8n).`,
    );
    console.error("Use .env.local with N8N_API_URL=http://localhost:5678");
    process.exit(1);
  }

  console.log(`Bootstrapping workflows on ${env.apiUrl}...\n`);

  const demoId = await upsertWorkflow(env, "demo");
  const followUpId = await upsertWorkflow(env, "followup");

  console.log("\nAdd to .env.local (if not already set):");
  console.log(`N8N_DEMO_WORKFLOW_ID=${demoId}`);
  console.log(`N8N_DEMO_FOLLOWUP_WORKFLOW_ID=${followUpId}`);
  console.log("\nAPI container (compose.dev) already points webhooks at http://n8n:5678/webhook/...");
  console.log("Submit a demo via POST http://localhost:4000/api/leads/demo to test end-to-end.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
