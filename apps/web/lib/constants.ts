// Copied from /columbus-ai:lib/constants.ts (Phase 0 UI shell only)

export const SITE_NAME = "Columbus AI Automation Solutions LLC";

/** Base URL for backend API (chat, messages). Set NEXT_PUBLIC_API_URL (e.g. http://localhost:4000) when the API runs as a separate service. */
export const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";

export const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export const FOOTER_PRODUCT_LINKS = [
  { href: "/#what-we-do", label: "What We Do" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

/** Footer contact column. Default email shown when env unset. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@columbusai.tech";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";

/** Tailwind class for capping helper/description text width (e.g. under form fields). */
export const HELPER_TEXT_MAX_W = "max-w-[280px]";

const FOOTER_TAGLINE =
  "AI automation that streamlines your workflows.";
const BOTTOM_TAGLINE =
  "Streamline workflows with intelligent automation.";