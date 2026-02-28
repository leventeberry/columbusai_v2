import type { Lead } from "./validateLead";

export async function sendLeadToN8n(
  webhookUrl: string,
  lead: Lead
): Promise<void> {
  const bookingLink =
    process.env.BOOKING_LINK || "https://calendly.com/yourlink";
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
      console.error("n8n webhook status", res.status);
    }
  } catch (err) {
    console.error("n8n webhook:", err);
  }
}
