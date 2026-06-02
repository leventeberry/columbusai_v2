import { listAllWorkflows } from "./lib/client";
import { loadN8nEnv } from "./lib/env";

async function main() {
  const env = loadN8nEnv();
  const workflows = await listAllWorkflows(env);

  const idW = Math.max(2, ...workflows.map((w) => String(w.id ?? "").length));
  const nameW = Math.max(4, ...workflows.map((w) => String(w.name ?? "").length));

  console.log(
    `${"id".padEnd(idW)}  ${"name".padEnd(nameW)}  active  updatedAt`
  );
  for (const w of workflows) {
    const id = String(w.id ?? "");
    const name = String(w.name ?? "");
    const active = w.active ? "true" : "false";
    const updatedAt = String(w.updatedAt ?? "");
    console.log(
      `${id.padEnd(idW)}  ${name.padEnd(nameW)}  ${active.padEnd(6)}  ${updatedAt}`
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
