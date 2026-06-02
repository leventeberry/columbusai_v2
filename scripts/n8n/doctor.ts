import { listAllWorkflows, n8nRequest } from "./lib/client";
import { loadEnvFiles, loadN8nEnv } from "./lib/env";

async function main() {
  loadEnvFiles();
  const apiUrl = process.env.N8N_API_URL?.trim() || "(unset)";
  const hasKey = !!process.env.N8N_API_KEY?.trim();
  const localFile = process.env.N8N_API_URL?.includes("localhost") ?? false;

  console.log("n8n workflow dev doctor");
  console.log("─".repeat(40));
  console.log(`N8N_API_URL:     ${apiUrl}`);
  console.log(`N8N_API_KEY:     ${hasKey ? "set" : "MISSING"}`);
  const profile = process.env.COLUMBUS_ENV?.trim() || "local";
  console.log(`COLUMBUS_ENV:    ${profile} (.env.${profile === "local" ? "local" : profile})`);
  console.log(`Local n8n URL:   ${localFile ? "yes" : "no — use .env.local for laptop dev"}`);

  if (!hasKey) {
    console.error("\nCreate .env.local from .env.local.example and add an API key.");
    process.exit(1);
  }

  try {
    const env = loadN8nEnv();
    await n8nRequest(env, "GET", "/api/v1/workflows?limit=1");
    const workflows = await listAllWorkflows(env);
    console.log(`\nAPI connection:  OK (${workflows.length} workflow(s))`);
    const names = ["ColumbusAI_Demo_Request", "ColumbusAI_Demo_Follow_Up"];
    for (const name of names) {
      const w = workflows.find((x) => x.name === name);
      console.log(
        `  ${name}: ${w ? `${w.id} (active=${w.active})` : "not found — run pnpm n8n:bootstrap-local"}`,
      );
    }
    console.log("\nNext: pnpm n8n:bootstrap-local  or  pnpm n8n:push:demo / push:followup");
  } catch (err) {
    console.error(`\nAPI connection:  FAILED`);
    console.error(err instanceof Error ? err.message : err);
    if (apiUrl.includes("n8n.columbusai.tech")) {
      console.error("\nFor local dev, use .env.local with N8N_API_URL=http://localhost:5678");
    }
    process.exit(1);
  }
}

main();
