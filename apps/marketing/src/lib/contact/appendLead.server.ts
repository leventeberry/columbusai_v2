import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead } from "./types";
import { insertLead } from "../db/leads.server";

export async function appendLead(lead: Lead): Promise<void> {
  if (process.env.DATABASE_URL) {
    await insertLead(lead);
    return;
  }
  const leadsPath =
    process.env.LEADS_PATH || path.join(process.cwd(), "leads.jsonl");
  const line = `${JSON.stringify(lead)}\n`;
  await fs.appendFile(leadsPath, line, "utf8");
}
