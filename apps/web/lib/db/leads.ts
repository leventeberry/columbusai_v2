import type { Lead } from "@/lib/contact/validateLead";
import { getPool } from "./client";

const INSERT_LEAD = `
INSERT INTO leads (
  id, fname, lname, email, phone, company, role, industry,
  team_size, what_automate, budget, timeline, website, created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
`;

export async function insertLead(lead: Lead): Promise<void> {
  const pool = await getPool();
  await pool.query(INSERT_LEAD, [
    lead.id,
    lead.fname,
    lead.lname,
    lead.email,
    lead.phone,
    lead.company,
    lead.role,
    lead.industry,
    lead.team_size,
    lead.what_automate,
    lead.budget,
    lead.timeline,
    lead.website,
    lead.created_at,
  ]);
}
