import type { z } from "zod";
import {
  contactPayloadSchema,
  zodErrorsToFieldErrors,
} from "@columbusai/leads/validation";

export { contactPayloadSchema };

export type ContactPayloadSchema = z.infer<typeof contactPayloadSchema>;

/** Map Zod errors to ContactErrors (field -> message) for API response */
export function zodErrorsToContactErrors(error: z.ZodError): Record<string, string> {
  const errors = zodErrorsToFieldErrors(error);
  // Web simple contact form uses `message`; canonical schema reports `what_automate`.
  if (errors.what_automate && !errors.message) {
    errors.message = errors.what_automate;
    delete errors.what_automate;
  }
  return errors;
}
