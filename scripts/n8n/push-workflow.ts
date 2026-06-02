// n8n Public API v1: PATCH on Cloud; local Docker often requires PUT (auto-fallback).
import fs from "node:fs";
import path from "node:path";
import { type N8nWorkflow, updateWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import {
  assertWorkflowIdMatch,
  sanitizeForPush,
} from "./lib/workflow-payload";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  "infra/n8n/workflows/demo-request.workflow.json"
);

async function main() {
  const env = loadN8nEnv({ requireDemoWorkflowId: true });
  const id = env.demoWorkflowId!;

  if (!fs.existsSync(WORKFLOW_PATH)) {
    console.error(`Workflow file not found: ${WORKFLOW_PATH}`);
    console.error("Run: npm run n8n:pull:demo");
    process.exit(1);
  }

  const raw = fs.readFileSync(WORKFLOW_PATH, "utf8");
  const workflow = JSON.parse(raw) as N8nWorkflow;
  assertWorkflowIdMatch(workflow, id);

  const body = sanitizeForPush(workflow);
  const updated = await updateWorkflow(env, id, body);

  console.log(
    `Pushed workflow ${updated.id ?? id}: ${updated.name ?? workflow.name ?? "(unnamed)"}`
  );
  if (updated.updatedAt) {
    console.log(`updatedAt: ${updated.updatedAt}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
