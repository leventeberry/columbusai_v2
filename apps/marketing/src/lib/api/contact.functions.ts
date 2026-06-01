import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { appendLead } from "../contact/appendLead.server";
import { sendLeadToN8n } from "../contact/sendLeadToN8n.server";
import type { Lead } from "../contact/types";
import {
  apiErrorsToFormErrors,
  contactPayloadSchema,
  normalizeWebsite,
  zodErrorsToFieldErrors,
} from "../contact/validation";

const trim = (s: unknown) => (s == null ? "" : String(s).trim());

const submitContactInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  company: z.string(),
  website: z.string().optional(),
  role: z.string().optional(),
  industry: z.string().optional(),
  teamSize: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  automate: z.string(),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(submitContactInput)
  .handler(async ({ data }) => {
    const body = {
      fname: trim(data.firstName),
      lname: trim(data.lastName),
      email: trim(data.email),
      phone: trim(data.phone),
      company: trim(data.company),
      website: normalizeWebsite(data.website),
      role: trim(data.role),
      industry: trim(data.industry),
      team_size: trim(data.teamSize),
      timeline: trim(data.timeline),
      budget: trim(data.budget),
      what_automate: trim(data.automate),
    };

    const parsed = contactPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return {
        ok: false as const,
        errors: apiErrorsToFormErrors(zodErrorsToFieldErrors(parsed.error)),
      };
    }

    const p = parsed.data;
    const lead: Lead = {
      id: crypto.randomUUID(),
      fname: trim(p.fname),
      lname: trim(p.lname),
      email: trim(p.email),
      phone: trim(p.phone),
      company: trim(p.company),
      role: trim(p.role),
      industry: trim(p.industry),
      team_size: trim(p.team_size),
      what_automate: trim(p.what_automate) || trim(p.message),
      budget: trim(p.budget),
      timeline: trim(p.timeline),
      website: normalizeWebsite(p.website),
      created_at: new Date().toISOString(),
    };

    try {
      await appendLead(lead);
    } catch (err) {
      console.error("appendLead failed:", err);
      return {
        ok: false as const,
        errors: { _form: "Failed to save lead. Please try again." },
      };
    }

    const nodeEnv = process.env.NODE_ENV;
    const webhookUrl =
      nodeEnv === "development"
        ? process.env.N8N_WEBHOOK_TEST_URL
        : process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        ok: false as const,
        errors: { _form: "N8N webhook URL not set" },
      };
    }
    await sendLeadToN8n(webhookUrl, lead);

    return { ok: true as const };
  });
