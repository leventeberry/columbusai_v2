import { z } from "zod";

const optionalUrl = z
  .string()
  .optional()
  .refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Please enter a valid URL",
  });

const namePattern = /^[a-zA-Z\s\-']+$/;
const rolePattern = /^[a-zA-Z\s\-'&.]*$/;
const phonePattern = /^[\d\s\-+().]+$/;
const phoneMinDigits = 10;

/**
 * Schema for POST /api/contact body. Required fields and patterns align with request-demo form.
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
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine((v) => phonePattern.test(v), {
      message: "Phone can only contain numbers, spaces, +, -, (), or periods",
    })
    .refine((v) => v.replace(/\D/g, "").length >= phoneMinDigits, {
      message: "Enter at least 10 digits",
    }),
  company: z.string().min(1, "Company is required"),
  what_automate: z.string().min(1, "Please describe what you want to automate"),
  role: z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "" || rolePattern.test(v.trim()), {
      message: "Role can only contain letters, spaces, hyphens, apostrophes, &, or periods",
    }),
  industry: z.string().optional(),
  team_size: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  website: optionalUrl,
});

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
