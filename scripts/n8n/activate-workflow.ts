import { n8nRequest, type N8nWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";
import { getWorkflowConfig, resolveWorkflowKey } from "./lib/workflows";

async function main() {
  const config = getWorkflowConfig(resolveWorkflowKey());
  const env = loadN8nEnv(
    config.key === "demo"
      ? { requireDemoWorkflowId: true }
      : { requireFollowUpWorkflowId: true },
  );
  const id =
    config.key === "demo" ? env.demoWorkflowId! : env.followUpWorkflowId!;

  const activated = await n8nRequest<N8nWorkflow>(
    env,
    "POST",
    `/api/v1/workflows/${id}/activate`,
    {},
  );

  const name = activated?.name ?? config.label;
  console.log(`Activated ${id} (${name})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
