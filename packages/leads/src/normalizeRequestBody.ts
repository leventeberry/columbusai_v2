import { normalizeWebsite } from "./validation.js";

const trim = (s: unknown) => (s == null ? "" : String(s).trim());

/**
 * Normalize POST body from API (snake_case) or legacy/marketing aliases to contact schema keys.
 */
export function normalizeRequestBody(
  raw: Record<string, unknown>
): Record<string, string> {
  const first =
    raw.first_name ?? raw.firstName ?? raw.fname ?? "";
  const last = raw.last_name ?? raw.lastName ?? raw.lname ?? "";
  const team =
    raw.team_size ?? raw.teamSize ?? "";
  const automate =
    raw.what_automate ?? raw.automate ?? raw.message ?? "";

  return {
    fname: trim(first),
    lname: trim(last),
    email: trim(raw.email),
    phone: trim(raw.phone),
    company: trim(raw.company),
    website: normalizeWebsite(
      typeof raw.website === "string" ? raw.website : undefined
    ),
    role: trim(raw.role),
    industry: trim(raw.industry),
    team_size: trim(team),
    timeline: trim(raw.timeline),
    budget: trim(raw.budget),
    what_automate: trim(automate),
    message: trim(raw.message),
  };
}
