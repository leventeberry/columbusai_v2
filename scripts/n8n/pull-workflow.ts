import fs from "node:fs";
import path from "node:path";
import { n8nRequest, type N8nWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import { sanitizeForRepo } from "./lib/workflow-payload";

const OUT_PATH = path.join(
  process.cwd(),
  "infra/n8n/workflows/demo-request.workflow.json"
);

async function main() {
  const env = loadN8nEnv({ requireDemoWorkflowId: true });
  const id = env.demoWorkflowId!;

  const workflow = await n8nRequest<N8nWorkflow>(
    env,
    "GET",
    `/api/v1/workflows/${id}`
  );

  const sanitized = sanitizeForRepo(workflow);
  sanitized.id = id;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");

  console.log(`Saved ${OUT_PATH}`);
  console.log(`Workflow: ${workflow.name ?? "(unnamed)"} (${id})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
