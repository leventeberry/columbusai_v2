/** Resolve demo webhook URL (server-only). Prefers N8N_DEMO_* with legacy fallbacks. */
export function getDemoWebhookUrl(): string | null {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return (
      process.env.N8N_DEMO_WEBHOOK_TEST_URL?.trim() ||
      process.env.N8N_WEBHOOK_TEST_URL?.trim() ||
      null
    );
  }
  return (
    process.env.N8N_DEMO_WEBHOOK_URL?.trim() ||
    process.env.N8N_WEBHOOK_URL?.trim() ||
    null
  );
}
