// n8n Public API v1: PATCH on Cloud; local Docker often requires PUT (auto-fallback).
import fs from "node:fs";
import { type N8nWorkflow, updateWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import {
  assertWorkflowIdMatch,
  sanitizeForPush,
} from "./lib/workflow-payload";
import {
  getWorkflowConfig,
  resolveWorkflowKey,
  workflowFilePath,
} from "./lib/workflows";

async function main() {
  const config = getWorkflowConfig(resolveWorkflowKey());
  const env = loadN8nEnv(
    config.key === "demo"
      ? { requireDemoWorkflowId: true }
      : { requireFollowUpWorkflowId: true },
  );
  const id =
    config.key === "demo" ? env.demoWorkflowId! : env.followUpWorkflowId!;

  const workflowPath = workflowFilePath(config);
  if (!fs.existsSync(workflowPath)) {
    console.error(`Workflow file not found: ${workflowPath}`);
    console.error(`Run: pnpm n8n:pull:${config.key === "demo" ? "demo" : "followup"}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(workflowPath, "utf8");
  const workflow = JSON.parse(raw) as N8nWorkflow;
  assertWorkflowIdMatch(workflow, id, config.envVar);

  const body = sanitizeForPush(workflow);
  const updated = await updateWorkflow(env, id, body);

  console.log(
    `Pushed workflow ${updated.id ?? id}: ${updated.name ?? workflow.name ?? "(unnamed)"}`,
  );
  if (updated.updatedAt) {
    console.log(`updatedAt: ${updated.updatedAt}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
