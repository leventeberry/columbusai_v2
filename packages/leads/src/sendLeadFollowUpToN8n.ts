import { buildFollowUpPayload } from "./buildFollowUpPayload.js";
import type { Lead } from "./types.js";
import type { N8nSendResult } from "./sendLeadToN8n.js";

/**
 * POST follow-up trigger payload to n8n (snake_case body; n8n Webhook wraps as `body`).
 */
export async function sendLeadFollowUpToN8n(
  webhookUrl: string,
  lead: Lead,
): Promise<N8nSendResult> {
  const payload = buildFollowUpPayload(lead);
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status < 200 || res.status >= 300) {
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
