import { NextRequest, NextResponse } from "next/server";
import type { Lead } from "@/lib/contact/validateLead";
import { appendLead } from "@/lib/contact/appendLead";
import { sendLeadToN8n } from "@/lib/contact/sendLeadToN8n";
import {
  contactPayloadSchema,
  zodErrorsToContactErrors,
} from "@/lib/validations/contact";

const trim = (s: unknown) => (s == null ? "" : String(s).trim());

export async function POST(request: NextRequest) {
  
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { _form: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = contactPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = zodErrorsToContactErrors(parsed.error);
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const p = parsed.data;
  const lead: Lead = {
    id: crypto.randomUUID(),
    fname: trim(p.fname),
    lname: trim(p.lname),
    email: trim(p.email),
    phone: "",
    company: "",
    role: "",
    industry: "",
    team_size: "",
    what_automate: trim(p.message),
    budget: "",
    timeline: "",
    website: "",
    created_at: new Date().toISOString(),
  };

  try {
    await appendLead(lead);
  } catch (err) {
    console.error("appendLead failed:", err);
    return NextResponse.json(
      { ok: false, errors: { _form: "Failed to save lead. Please try again." } },
      { status: 500 }
    );
  }

  const nodeEnv = process.env.NODE_ENV;
  const testUrl = process.env.N8N_WEBHOOK_TEST_URL;
  const prodUrl = process.env.N8N_WEBHOOK_URL;
  const webhookUrl =
    nodeEnv === "development" ? testUrl : prodUrl;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, errors: { _n8n: "N8N webhook URL not set" } },
      { status: 500 }
    );
  }
  await sendLeadToN8n(webhookUrl, lead);

  return NextResponse.json({ ok: true });
}
