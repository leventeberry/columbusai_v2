import { z } from "zod";

const namePattern = /^[a-zA-Z\s\-']+$/;

const optionalString = z.string().optional();

/**
 * Schema for POST /api/contact body. Supports both simple contact (fname, lname, email, message)
 * and full demo payload (phone, company, role, industry, team_size, website, what_automate, budget, timeline).
 */
export const contactPayloadSchema = z.object({
  fname: z
    .string()
    .min(1, "First name is required")
    .refine((v) => namePattern.test(v.trim()), {
      message: "First name can only contain letters, spaces, hyphens, or apostrophes",
    }),
  lname: z
    .string()
    .min(1, "Last name is required")
    .refine((v) => namePattern.test(v.trim()), {
      message: "Last name can only contain letters, spaces, hyphens, or apostrophes",
    }),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  message: z.string().optional(),
  phone: optionalString,
  company: optionalString,
  role: optionalString,
  industry: optionalString,
  team_size: optionalString,
  website: optionalString,
  what_automate: optionalString,
  budget: optionalString,
  timeline: optionalString,
}).refine(
  (data) => (data.message?.trim() ?? "") !== "" || (data.what_automate?.trim() ?? "") !== "",
  { message: "Message or what you want to automate is required", path: ["message"] }
);

export type ContactPayloadSchema = z.infer<typeof contactPayloadSchema>;

/** Map Zod errors to ContactErrors (field -> message) for API response */
export function zodErrorsToContactErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
