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
