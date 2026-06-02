import { apiErrorsToFormErrors } from "@columbusai/leads/validation";
import { getApiBaseUrl } from "@/lib/env";

export type DemoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  role?: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
  budget?: string;
  automate: string;
};

export type SubmitDemoLeadResult =
  | { ok: true; id?: string }
  | { ok: false; errors: Record<string, string> };

function toApiBody(data: DemoFormData): Record<string, string> {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone ?? "",
    company: data.company,
    website: data.website ?? "",
    role: data.role ?? "",
    industry: data.industry ?? "",
    team_size: data.teamSize ?? "",
    timeline: data.timeline ?? "",
    budget: data.budget ?? "",
    what_automate: data.automate,
  };
}

export async function submitDemoLead(data: DemoFormData): Promise<SubmitDemoLeadResult> {
  const base = getApiBaseUrl();
  if (!base) {
    return {
      ok: false,
      errors: { _form: "API URL is not configured." },
    };
  }

  const res = await fetch(`${base}/api/leads/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(data)),
  });

  let json: { ok?: boolean; id?: string; errors?: Record<string, string> };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    return {
      ok: false,
      errors: { _form: "Something went wrong. Please try again." },
    };
  }

  if (res.ok && json.ok) {
    return { ok: true, id: json.id };
  }

  const errors = json.errors ?? {};
  return {
    ok: false,
    errors: apiErrorsToFormErrors(errors),
  };
}
