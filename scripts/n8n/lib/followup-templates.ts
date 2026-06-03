/** Follow-up template workflow names in n8n (must match generate-followup-templates.ts). */
import type { FollowupTemplateId } from "../../packages/leads/src/followup/templates.js";

export const FOLLOWUP_TEMPLATE_WORKFLOW_NAMES: Record<FollowupTemplateId, string> = {
  "2day": "ColumbusAI_Demo_Follow_Up_2_Day",
  "7day": "ColumbusAI_Demo_Follow_Up_7_Day",
  "14day": "ColumbusAI_Demo_Follow_Up_14_Day",
};

export const FOLLOWUP_TEMPLATE_IDS: FollowupTemplateId[] = ["2day", "7day", "14day"];

export function followupTemplateWorkflowPath(id: FollowupTemplateId): string {
  return `infra/n8n/workflows/templates/demo-follow-up-template-${id}.workflow.json`;
}
