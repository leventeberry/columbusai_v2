export type { Lead, DemoLeadResult } from "./types.js";
export type { N8nSendResult } from "./sendLeadToN8n.js";
export { appendLead } from "./appendLead.js";
export { getPool } from "./db/client.js";
export { insertLead } from "./db/insertLead.js";
export { sendLeadToN8n } from "./sendLeadToN8n.js";
export { getDemoWebhookUrl } from "./webhookUrl.js";
export {
  followupWait1Minutes,
  followupWait2Minutes,
  initialNextFollowupAt,
} from "./followupSchedule.js";
export {
  FOLLOWUP_TEMPLATES,
  FOLLOWUP_TEMPLATE_IDS,
  isFollowupTemplateId,
  getFollowupTemplate,
  resolveDefaultFollowupTemplate,
  type FollowupTemplateId,
  type FollowupObjective,
  type FollowupTemplate,
  type FollowupTouch,
} from "./followup/templates.js";
export {
  nextFollowupAt,
  initialNextFollowupAtForTemplate,
  nextTouchDayAfterSend,
  followupTouchCount,
} from "./followup/schedule.js";
export { FOLLOWUP_EMAIL_COPY, type FollowupEmailCopy } from "./followup/emailCopy.js";
export { resolveLeadFollowupInit, type LeadFollowupInit } from "./followup/leadFollowupInit.js";
export { processDemoLead, type LeadLogFn } from "./processDemoLead.js";
export { normalizeRequestBody } from "./normalizeRequestBody.js";
export {
  contactPayloadSchema,
  zodErrorsToFieldErrors,
  apiErrorsToFormErrors,
  fieldErrorsToApiErrors,
  normalizeWebsite,
} from "./validation.js";
