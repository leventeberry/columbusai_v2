export type FollowupObjective =
  | "reminder"
  | "value"
  | "social_proof"
  | "objection_handling"
  | "re_engagement"
  | "final_close";

export type FollowupTemplateId = "2day" | "7day" | "14day";

export type FollowupTouch = {
  day: number;
  objective: FollowupObjective;
};

export type FollowupTemplate = {
  id: FollowupTemplateId;
  label: string;
  touches: FollowupTouch[];
};

export const FOLLOWUP_TEMPLATE_IDS: FollowupTemplateId[] = ["2day", "7day", "14day"];

export const FOLLOWUP_TEMPLATES: Record<FollowupTemplateId, FollowupTemplate> = {
  "2day": {
    id: "2day",
    label: "2-Day Accelerated",
    touches: [
      { day: 1, objective: "reminder" },
      { day: 2, objective: "value" },
      { day: 5, objective: "social_proof" },
      { day: 7, objective: "final_close" },
    ],
  },
  "7day": {
    id: "7day",
    label: "7-Day Standard",
    touches: [
      { day: 1, objective: "reminder" },
      { day: 3, objective: "value" },
      { day: 7, objective: "social_proof" },
      { day: 10, objective: "objection_handling" },
      { day: 14, objective: "final_close" },
    ],
  },
  "14day": {
    id: "14day",
    label: "14-Day Extended",
    touches: [
      { day: 1, objective: "reminder" },
      { day: 3, objective: "value" },
      { day: 7, objective: "social_proof" },
      { day: 14, objective: "objection_handling" },
      { day: 21, objective: "re_engagement" },
      { day: 28, objective: "final_close" },
    ],
  },
};

export function isFollowupTemplateId(value: string): value is FollowupTemplateId {
  return value in FOLLOWUP_TEMPLATES;
}

export function getFollowupTemplate(id: FollowupTemplateId): FollowupTemplate {
  return FOLLOWUP_TEMPLATES[id];
}

/** Optional env DEFAULT_FOLLOWUP_TEMPLATE — unset means legacy Columbus flow. */
export function resolveDefaultFollowupTemplate(): FollowupTemplateId | null {
  const raw = process.env.DEFAULT_FOLLOWUP_TEMPLATE?.trim();
  if (!raw) return null;
  if (!isFollowupTemplateId(raw)) {
    console.warn(
      JSON.stringify({
        message: "invalid_default_followup_template",
        value: raw,
        allowed: FOLLOWUP_TEMPLATE_IDS,
      }),
    );
    return null;
  }
  return raw;
}
