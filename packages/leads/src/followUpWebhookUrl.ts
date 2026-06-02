/** Resolve demo follow-up webhook URL (server-only). */
export function getDemoFollowUpWebhookUrl(): string | null {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return process.env.N8N_DEMO_FOLLOWUP_WEBHOOK_TEST_URL?.trim() || null;
  }
  return process.env.N8N_DEMO_FOLLOWUP_WEBHOOK_URL?.trim() || null;
}
