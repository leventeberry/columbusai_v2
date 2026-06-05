import { z } from "zod";

const namePattern = /^[a-zA-Z\s\-']+$/;

export const contactPayloadSchema = z
  .object({
    fname: z
      .string()
      .min(1, "First name is required")
      .refine((v) => namePattern.test(v.trim()), {
        message:
          "First name can only contain letters, spaces, hyphens, or apostrophes",
      }),
    lname: z
      .string()
      .min(1, "Last name is required")
      .refine((v) => namePattern.test(v.trim()), {
        message:
          "Last name can only contain letters, spaces, hyphens, or apostrophes",
      }),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    message: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    industry: z.string().optional(),
    team_size: z.string().optional(),
    website: z.string().optional(),
    what_automate: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.message?.trim() ?? "") !== "" ||
      (data.what_automate?.trim() ?? "") !== "",
    {
      message: "Message or what you want to automate is required",
      path: ["what_automate"],
    }
  );

export function zodErrorsToFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

/** Map API/snake_case field errors to marketing form camelCase keys */
export function apiErrorsToFormErrors(
  errors: Record<string, string>
): Record<string, string> {
  const map: Record<string, string> = {
    first_name: "firstName",
    last_name: "lastName",
    fname: "firstName",
    lname: "lastName",
    team_size: "teamSize",
    what_automate: "automate",
  };
  const out: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    if (key === "_form" || key === "_n8n") {
      out._form = message;
      continue;
    }
    out[map[key] ?? key] = message;
  }
  return out;
}

/** Map internal fname/lname errors to public API field names */
export function fieldErrorsToApiErrors(
  errors: Record<string, string>
): Record<string, string> {
  const map: Record<string, string> = {
    fname: "first_name",
    lname: "last_name",
  };
  const out: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    if (key === "_form" || key === "_n8n") {
      out._form = message;
      continue;
    }
    out[map[key] ?? key] = message;
  }
  return out;
}

export function normalizeWebsite(website: string | undefined): string {
  const s = (website ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/** Marketing demo form (camelCase) — maps to canonical contactPayloadSchema. */
export type MarketingDemoFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  role?: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
  budget?: string;
  automate: string;
};

export function marketingFormToContactPayload(data: MarketingDemoFormInput) {
  return {
    fname: data.firstName.trim(),
    lname: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? "",
    company: data.company.trim(),
    website: data.website?.trim() ?? "",
    role: data.role?.trim() ?? "",
    industry: data.industry?.trim() ?? "",
    team_size: data.teamSize?.trim() ?? "",
    timeline: data.timeline?.trim() ?? "",
    budget: data.budget?.trim() ?? "",
    what_automate: data.automate.trim(),
  };
}

export function validateMarketingDemoForm(
  data: MarketingDemoFormInput,
):
  | { success: true; payload: z.infer<typeof contactPayloadSchema> }
  | { success: false; errors: Record<string, string> } {
  const result = contactPayloadSchema.safeParse(marketingFormToContactPayload(data));
  if (result.success) {
    return { success: true, payload: result.data };
  }
  return {
    success: false,
    errors: apiErrorsToFormErrors(zodErrorsToFieldErrors(result.error)),
  };
}

/** Admin manual lead create — shared between API and admin server functions. */
export const manualLeadSchema = z.object({
  fname: z.string().min(1).max(200),
  lname: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional().default(""),
  company: z.string().max(300).optional().default(""),
  role: z.string().max(200).optional().default(""),
  industry: z.string().max(200).optional().default(""),
  teamSize: z.string().max(100).optional().default(""),
  whatAutomate: z.string().min(1).max(1000),
  budget: z.string().max(200).optional().default(""),
  timeline: z.string().max(200).optional().default(""),
  website: z.string().max(500).optional().default(""),
  notes: z.string().max(5000).optional(),
});

export type ManualLeadInput = z.infer<typeof manualLeadSchema>;
