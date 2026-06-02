import path from "node:path";

export type WorkflowKey = "demo" | "followup";

export type WorkflowConfig = {
  key: WorkflowKey;
  label: string;
  envVar: string;
  filePath: string;
};

export const WORKFLOW_CONFIGS: Record<WorkflowKey, WorkflowConfig> = {
  demo: {
    key: "demo",
    label: "ColumbusAI_Demo_Request",
    envVar: "N8N_DEMO_WORKFLOW_ID",
    filePath: "infra/n8n/workflows/demo-request.workflow.json",
  },
  followup: {
    key: "followup",
    label: "ColumbusAI_Demo_Follow_Up",
    envVar: "N8N_DEMO_FOLLOWUP_WORKFLOW_ID",
    filePath: "infra/n8n/workflows/demo-follow-up.workflow.json",
  },
};

/** Webhook path UUID for demo-request — not a workflow id. */
export const DEMO_WEBHOOK_PATH_ID = "f7ceff32-3922-4ac8-a522-2b83995e5f04";

export function resolveWorkflowKey(argv: string[] = process.argv): WorkflowKey {
  const arg = argv[2]?.trim().toLowerCase();
  if (arg === "followup" || arg === "follow-up" || arg === "demo-follow-up") {
    return "followup";
  }
  return "demo";
}

export function getWorkflowConfig(key: WorkflowKey): WorkflowConfig {
  return WORKFLOW_CONFIGS[key];
}

export function workflowFilePath(config: WorkflowConfig): string {
  return path.join(process.cwd(), config.filePath);
}
