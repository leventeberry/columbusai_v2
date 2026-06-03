/**
 * Push 2-day / 7-day / 14-day follow-up template workflows to n8n (inactive).
 * Creates workflows by name if missing; updates if they already exist.
 */
import fs from "node:fs";
import path from "node:path";
import {
  createWorkflow,
  listAllWorkflows,
  updateWorkflow,
  type N8nWorkflow,
} from "./lib/client";
import {
  FOLLOWUP_TEMPLATE_IDS,
  FOLLOWUP_TEMPLATE_WORKFLOW_NAMES,
  followupTemplateWorkflowPath,
} from "./lib/followup-templates";
import { loadN8nEnv } from "./lib/env";
import { sanitizeForPush } from "./lib/workflow-payload";

function existingByName(workflows: N8nWorkflow[]): Map<string, N8nWorkflow> {
  const map = new Map<string, N8nWorkflow>();
  for (const w of workflows) {
    if (w.isArchived) continue;
    const name = String(w.name ?? "");
    if (!name) continue;
    const prev = map.get(name);
    if (!prev || (w.active && !prev.active)) {
      map.set(name, w);
    }
  }
  return map;
}

async function upsertByName(
  env: ReturnType<typeof loadN8nEnv>,
  workflow: N8nWorkflow,
  existingByName: Map<string, N8nWorkflow>,
): Promise<string> {
  const name = String(workflow.name ?? "");
  const body = sanitizeForPush(workflow);
  const existing = existingByName.get(name);

  if (existing?.id) {
    const updated = await updateWorkflow(env, String(existing.id), body);
    console.log(`Updated ${name} (${updated.id ?? existing.id})`);
    return String(updated.id ?? existing.id);
  }

  const created = await createWorkflow(env, body);
  const id = String(created.id ?? "");
  if (!id) throw new Error(`Create ${name} did not return an id`);
  console.log(`Created ${name} (${id})`);
  return id;
}

async function main() {
  const env = loadN8nEnv();
  const existing = await listAllWorkflows(env);
  const byName = existingByName(existing);

  console.log(`Pushing follow-up templates to ${env.apiUrl}...\n`);

  const ids: Record<string, string> = {};

  for (const templateId of FOLLOWUP_TEMPLATE_IDS) {
    const relPath = followupTemplateWorkflowPath(templateId);
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing ${filePath} — run: pnpm n8n:generate:followup-templates`);
      process.exit(1);
    }

    const workflow = JSON.parse(fs.readFileSync(filePath, "utf8")) as N8nWorkflow;
    const expectedName = FOLLOWUP_TEMPLATE_WORKFLOW_NAMES[templateId];
    if (workflow.name !== expectedName) {
      console.error(
        `Name mismatch in ${relPath}: expected "${expectedName}", got "${workflow.name}"`,
      );
      process.exit(1);
    }

    ids[templateId] = await upsertByName(env, workflow, byName);
  }

  console.log("\nFollow-up template workflows (left inactive):");
  for (const templateId of FOLLOWUP_TEMPLATE_IDS) {
    console.log(`  ${FOLLOWUP_TEMPLATE_WORKFLOW_NAMES[templateId]}: ${ids[templateId]}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
