import type { Lead } from "./types.js";

export type N8nSendResult =
  | { ok: true; status: number }
  | { ok: false; status?: number; error?: string };

/**
 * POST lead payload to n8n (same shape as marketing / legacy web).
 * From apps/marketing/src/lib/contact/sendLeadToN8n.server.ts
 */
export async function sendLeadToN8n(
  webhookUrl: string,
  lead: Lead
): Promise<N8nSendResult> {
  const bookingLink =
    process.env.BOOKING_LINK || "https://cal.com/columbus-ai/30min";
  const payload = {
    id: lead.id,
    fname: lead.fname,
    lname: lead.lname,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    role: lead.role,
    industry: lead.industry,
    team_size: lead.team_size,
    what_automate: lead.what_automate,
    website: lead.website,
    budget: lead.budget,
    timeline: lead.timeline,
    created_at: lead.created_at,
    last_contact_at: "",
    followup_step: 0,
    booking_link: bookingLink,
  };
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
