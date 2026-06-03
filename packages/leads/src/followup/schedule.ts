import {
  getFollowupTemplate,
  type FollowupTemplateId,
} from "./templates.js";

const MS_PER_DAY = 86_400_000;

/** Absolute next follow-up from lead creation (day offsets in template registry). */
export function nextFollowupAt(
  createdAt: Date,
  templateId: FollowupTemplateId,
  followupCount: number,
): Date | null {
  const template = getFollowupTemplate(templateId);
  const touch = template.touches[followupCount];
  if (!touch) return null;
  return new Date(createdAt.getTime() + touch.day * MS_PER_DAY);
}

export function initialNextFollowupAtForTemplate(
  createdAt: Date,
  templateId: FollowupTemplateId,
): Date | null {
  return nextFollowupAt(createdAt, templateId, 0);
}

/** Day offset for the touch after the current followup_count (post-send scheduling). */
export function nextTouchDayAfterSend(
  templateId: FollowupTemplateId,
  followupCountBeforeSend: number,
): number | null {
  const template = getFollowupTemplate(templateId);
  const nextTouch = template.touches[followupCountBeforeSend + 1];
  return nextTouch?.day ?? null;
}

export function followupTouchCount(templateId: FollowupTemplateId): number {
  return getFollowupTemplate(templateId).touches.length;
}
