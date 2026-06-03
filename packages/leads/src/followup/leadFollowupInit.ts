import { initialNextFollowupAt } from "../followupSchedule.js";
import { initialNextFollowupAtForTemplate } from "./schedule.js";
import { resolveDefaultFollowupTemplate } from "./templates.js";

export type LeadFollowupInit = {
  followupTemplate: string | null;
  nextFollowupAt: Date;
};

/** Legacy env-minute flow when DEFAULT_FOLLOWUP_TEMPLATE is unset; registry flow otherwise. */
export function resolveLeadFollowupInit(createdAt: Date): LeadFollowupInit {
  const templateId = resolveDefaultFollowupTemplate();
  if (!templateId) {
    return {
      followupTemplate: null,
      nextFollowupAt: initialNextFollowupAt(createdAt),
    };
  }

  const next = initialNextFollowupAtForTemplate(createdAt, templateId);
  return {
    followupTemplate: templateId,
    nextFollowupAt: next ?? createdAt,
  };
}
