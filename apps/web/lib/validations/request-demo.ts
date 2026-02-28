import { z } from "zod";

const optionalUrl = z
  .string()
  .optional()
  .refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
    message: "Please enter a valid URL",
  });

export const BUDGET_OPTIONS = [
  "Under $1000",
  "$1000 – $2500",
  "$2500 – $5000",
  "$5000 – $10000",
  "$10000+",
] as const;

export const TEAM_SIZE_OPTIONS = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "200+",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Just exploring",
] as const;

const namePattern = /^[a-zA-Z\s\-']+$/;
const rolePattern = /^[a-zA-Z\s\-'&.]*$/;
const phonePattern = /^[\d\s\-+().]+$/;
const phoneMinDigits = 10;

export const requestDemoSchema = z.object({
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
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine((v) => phonePattern.test(v), {
      message: "Phone can only contain numbers, spaces, +, -, (), or periods",
    })
    .refine((v) => (v.replace(/\D/g, "").length >= phoneMinDigits), {
      message: "Enter at least 10 digits",
    }),
  company: z.string().min(1, "Company is required"),
  website: optionalUrl,
  role: z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "" || rolePattern.test(v.trim()), {
      message: "Role can only contain letters, spaces, hyphens, apostrophes, &, or periods",
    }),
  industry: z.string().optional(),
  team_size: z.string().optional(),
  what_automate: z.string().min(1, "Please describe what you want to automate"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

export type RequestDemoFormData = z.infer<typeof requestDemoSchema>;
