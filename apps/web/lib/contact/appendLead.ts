import { promises as fs } from "fs";
import path from "path";
import type { Lead } from "./validateLead";
import { insertLead } from "@/lib/db/leads";

export async function appendLead(lead: Lead): Promise<void> {
  const useDb = !!process.env.DATABASE_URL;
  if (useDb) {
    await insertLead(lead);
    return;
  }
  const leadsPath =
    process.env.LEADS_PATH || path.join(process.cwd(), "leads.jsonl");
  const line = JSON.stringify(lead) + "\n";
  await fs.appendFile(leadsPath, line, "utf8");
}
