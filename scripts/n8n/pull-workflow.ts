import fs from "node:fs";
import path from "node:path";
import { n8nRequest, type N8nWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import { sanitizeForRepo } from "./lib/workflow-payload";
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

  const workflow = await n8nRequest<N8nWorkflow>(
    env,
    "GET",
    `/api/v1/workflows/${id}`,
  );

  const sanitized = sanitizeForRepo(workflow);
  sanitized.id = id;

  const outPath = workflowFilePath(config);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");

  console.log(`Saved ${outPath}`);
  console.log(`Workflow: ${workflow.name ?? "(unnamed)"} (${id})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
