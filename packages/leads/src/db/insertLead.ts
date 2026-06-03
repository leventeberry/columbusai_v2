import { getPrismaClient } from "@columbusai/db";
import { resolveLeadFollowupInit } from "../followup/leadFollowupInit.js";
import type { Lead } from "../types.js";

function getPrisma() {
  return getPrismaClient();
}

/** Persists demo leads into sales.leads (Prisma-managed schema). */
export async function insertLead(lead: Lead): Promise<void> {
  const followup = resolveLeadFollowupInit(new Date(lead.created_at));
  await getPrisma().salesLead.create({
    data: {
      id: lead.id,
      createdAt: new Date(lead.created_at),
      fname: lead.fname,
      lname: lead.lname,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      role: lead.role,
      industry: lead.industry,
      teamSize: lead.team_size,
      whatAutomate: lead.what_automate,
      budget: lead.budget,
      timeline: lead.timeline,
      website: lead.website,
      status: "new",
      source: "demo_request",
      followupCount: 0,
      followupTemplate: followup.followupTemplate,
      nextFollowupAt: followup.nextFollowupAt,
    },
  });
}
