import type { ContactErrors } from "@/types/contact";

export type Lead = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
  what_automate: string;
  budget: string;
  timeline: string;
  website: string;
  created_at: string;
};

const emailRe = /^[^@]+@[^@]+\.[^@]+$/;

export function validateLead(body: Lead): {
  errors: ContactErrors;
  ok: boolean;
} {
  const errors: ContactErrors = {};
  if (!body.fname?.trim()) errors.fname = "First name is required.";
  if (!body.lname?.trim()) errors.lname = "Last name is required.";
  if (!body.email?.trim()) errors.email = "Email is required.";
  else if (!emailRe.test(body.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!body.phone?.trim()) errors.phone = "Phone is required.";
  if (!body.company?.trim()) errors.company = "Company is required.";
  if (!body.what_automate?.trim())
    errors.what_automate = "Please describe what you want to automate.";
  return { errors, ok: Object.keys(errors).length === 0 };
}
