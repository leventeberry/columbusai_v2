/** Minutes until first scheduled follow-up (env: FOLLOWUP_WAIT_1_MINUTES). */
export function followupWait1Minutes(): number {
  const raw = process.env.FOLLOWUP_WAIT_1_MINUTES?.trim();
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1440;
}

/** Minutes between first and second follow-up (env: FOLLOWUP_WAIT_2_MINUTES). */
export function followupWait2Minutes(): number {
  const raw = process.env.FOLLOWUP_WAIT_2_MINUTES?.trim();
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2880;
}

export function initialNextFollowupAt(now = new Date()): Date {
  return new Date(now.getTime() + followupWait1Minutes() * 60_000);
}
