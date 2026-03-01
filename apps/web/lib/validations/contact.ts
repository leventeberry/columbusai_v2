import { z } from "zod";

const namePattern = /^[a-zA-Z\s\-']+$/;

/**
 * Schema for POST /api/contact body. Aligns with ContactPayload (fname, lname, email, message).
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
  message: z.string().min(1, "Message is required"),
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
