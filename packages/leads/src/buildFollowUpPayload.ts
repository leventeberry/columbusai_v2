import type { Lead } from "./types.js";

export type FollowUpTriggerPayload = {
  lead_id: string;
  type: "demo_request";
  source: "demo_request";
  status: "new";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
  website: string;
  what_automate: string;
  budget: string;
  timeline: string;
  message: string;
  booking_link: string;
  priority: null;
  confidence: null;
  ai_summary: null;
  automation_opportunities: [];
  reasoning: null;
  recommended_next_action: null;
  created_at: string;
  updated_at: string;
};

/** Standardized snake_case payload for the demo follow-up n8n workflow. */
export function buildFollowUpPayload(lead: Lead): FollowUpTriggerPayload {
  const bookingLink =
    process.env.BOOKING_LINK || "https://cal.com/columbus-ai/30min";
  const now = lead.created_at || new Date().toISOString();

  return {
    lead_id: lead.id,
    type: "demo_request",
    source: "demo_request",
    status: "new",
    first_name: lead.fname,
    last_name: lead.lname,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    role: lead.role,
    industry: lead.industry,
    team_size: lead.team_size,
    website: lead.website,
    what_automate: lead.what_automate,
    budget: lead.budget,
    timeline: lead.timeline,
    message: lead.what_automate,
    booking_link: bookingLink,
    priority: null,
    confidence: null,
    ai_summary: null,
    automation_opportunities: [],
    reasoning: null,
    recommended_next_action: null,
    created_at: now,
    updated_at: now,
  };
}
