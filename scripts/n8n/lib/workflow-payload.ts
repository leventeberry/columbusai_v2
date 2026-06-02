import type { N8nWorkflow } from "./client";

const READ_ONLY_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "isArchived",
  "versionId",
  "triggerCount",
  "meta",
  "tags",
  "active",
  "shared",
  "homeProject",
  "scopes",
  "checksum",
  "activeVersionId",
  "versionCounter",
  "activeVersion",
]);

/** Settings keys accepted by n8n Public API PUT (extras like binaryMode are rejected). */
const SETTINGS_KEYS = new Set([
  "executionOrder",
  "timezone",
  "saveManualExecutions",
  "saveDataErrorExecution",
  "saveDataSuccessExecution",
  "saveExecutionProgress",
  "errorWorkflow",
  "callerPolicy",
  "timeSavedMode",
]);

function sanitizeSettings(
  settings: unknown
): Record<string, unknown> | undefined {
  if (!settings || typeof settings !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings as Record<string, unknown>)) {
    if (SETTINGS_KEYS.has(key)) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : { executionOrder: "v1" };
}

const PUSH_KEYS = ["name", "nodes", "connections", "settings", "staticData", "pinData"] as const;

/** Strip server-owned fields; keep id for repo verification. */
export function sanitizeForRepo(workflow: N8nWorkflow): N8nWorkflow {
  const out: N8nWorkflow = {};
  for (const [key, value] of Object.entries(workflow)) {
    if (READ_ONLY_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out;
}

/** Build update body — only updatable fields; credentials pass through via nodes as stored. */
export function sanitizeForPush(workflow: N8nWorkflow): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of PUSH_KEYS) {
    if (key === "settings") {
      const settings = sanitizeSettings(workflow.settings);
      if (settings) body.settings = settings;
      continue;
    }
    if (workflow[key] !== undefined) {
      body[key] = workflow[key];
    }
  }
  if (!body.settings) {
    body.settings = { executionOrder: "v1" };
  }
  if (body.nodes === undefined) body.nodes = [];
  if (body.connections === undefined) body.connections = {};
  return body;
}

export function assertWorkflowIdMatch(
  fileWorkflow: N8nWorkflow,
  expectedId: string
): void {
  const fileId = fileWorkflow.id;
  if (fileId && fileId !== expectedId) {
    console.error(
      `Workflow id mismatch: file has "${fileId}" but N8N_DEMO_WORKFLOW_ID is "${expectedId}"`
    );
    process.exit(1);
  }
}
