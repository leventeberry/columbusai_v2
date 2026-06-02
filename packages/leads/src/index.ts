export type { Lead, DemoLeadResult } from "./types.js";
export type { N8nSendResult } from "./sendLeadToN8n.js";
export { appendLead } from "./appendLead.js";
export { getPool } from "./db/client.js";
export { insertLead } from "./db/insertLead.js";
export { sendLeadToN8n } from "./sendLeadToN8n.js";
export { processDemoLead, type LeadLogFn } from "./processDemoLead.js";
export { getDemoWebhookUrl } from "./webhookUrl.js";
export { normalizeRequestBody } from "./normalizeRequestBody.js";
export {
  contactPayloadSchema,
  zodErrorsToFieldErrors,
  apiErrorsToFormErrors,
  fieldErrorsToApiErrors,
  normalizeWebsite,
} from "./validation.js";
