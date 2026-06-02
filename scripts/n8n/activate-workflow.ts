import { n8nRequest, type N8nWorkflow } from "./lib/client";
import { loadN8nEnv } from "./lib/env";

async function main() {
  const env = loadN8nEnv({ requireDemoWorkflowId: true });
  const id = env.demoWorkflowId!;

  const activated = await n8nRequest<N8nWorkflow>(
    env,
    "POST",
    `/api/v1/workflows/${id}/activate`,
    {}
  );

  const name = activated?.name ?? "(unnamed)";
  console.log(`Activated ${id} (${name})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
