// Copied from /columbus-ai:lib/constants.ts (Phase 0 UI shell only)

export const SITE_NAME = "Columbus AI Automation Solutions LLC";

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
  { href: "/privacy#cookies", label: "Cookie Policy" },
] as const;

/** Optional: set in env or override for footer contact column. If unset, footer shows Request Demo CTA. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
