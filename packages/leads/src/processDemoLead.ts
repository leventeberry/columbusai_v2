import { appendLead } from "./appendLead.js";
import { normalizeRequestBody } from "./normalizeRequestBody.js";
import { sendLeadToN8n } from "./sendLeadToN8n.js";
import type { DemoLeadResult, Lead } from "./types.js";
import { getDemoWebhookUrl } from "./webhookUrl.js";
import {
  contactPayloadSchema,
  fieldErrorsToApiErrors,
  normalizeWebsite,
  zodErrorsToFieldErrors,
} from "./validation.js";

const trim = (s: unknown) => (s == null ? "" : String(s).trim());

export type LeadLogFn = (
  event: string,
  data: Record<string, unknown>
) => void;

/**
 * Core demo lead handler — logic from apps/marketing/src/lib/api/contact.functions.ts
 * with webhook failures non-blocking after save.
 */
export async function processDemoLead(
  raw: Record<string, unknown>,
  options?: { requestId?: string; log?: LeadLogFn }
): Promise<DemoLeadResult> {
  const log =
    options?.log ??
    ((event, data) => {
      console.info(JSON.stringify({ message: event, ...data }));
    });

  const body = normalizeRequestBody(raw);
  const parsed = contactPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrorsToApiErrors(zodErrorsToFieldErrors(parsed.error));
    log("lead_validation_failed", {
      request_id: options?.requestId,
      error_count: Object.keys(errors).length,
    });
    return { ok: false, errors };
  }

  const p = parsed.data;
  const lead: Lead = {
    id: crypto.randomUUID(),
    fname: trim(p.fname),
    lname: trim(p.lname),
    email: trim(p.email),
    phone: trim(p.phone ?? ""),
    company: trim(p.company ?? ""),
    role: trim(p.role ?? ""),
    industry: trim(p.industry ?? ""),
    team_size: trim(p.team_size ?? ""),
    what_automate: trim(p.what_automate) || trim(p.message ?? ""),
    budget: trim(p.budget ?? ""),
    timeline: trim(p.timeline ?? ""),
    website: normalizeWebsite(p.website),
    created_at: new Date().toISOString(),
  };

  try {
    await appendLead(lead);
  } catch (err) {
    console.error(
      JSON.stringify({
        message: "lead_save_failed",
        request_id: options?.requestId,
        lead_id: lead.id,
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return {
      ok: false,
      errors: { _form: "Failed to save lead. Please try again." },
    };
  }

  log("lead_created", {
    request_id: options?.requestId,
    lead_id: lead.id,
    email_domain: lead.email.includes("@")
      ? lead.email.split("@")[1]
      : undefined,
  });

  const webhookUrl = getDemoWebhookUrl();
  if (!webhookUrl) {
    log("lead_webhook_skipped", {
      request_id: options?.requestId,
      lead_id: lead.id,
      reason: "webhook_url_unset",
    });
    return { ok: true, id: lead.id };
  }

  const webhookResult = await sendLeadToN8n(webhookUrl, lead);
  if (webhookResult.ok) {
    log("lead_webhook_sent", {
      request_id: options?.requestId,
      lead_id: lead.id,
      status: webhookResult.status,
    });
  } else {
    log("lead_webhook_failed", {
      request_id: options?.requestId,
      lead_id: lead.id,
      status: webhookResult.status,
      error: webhookResult.error,
    });
  }

  return { ok: true, id: lead.id };
}
