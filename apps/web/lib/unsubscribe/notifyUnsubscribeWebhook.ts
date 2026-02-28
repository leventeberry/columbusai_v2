import { isValidUnsubscribeToken } from "./validateToken";

/**
 * POSTs the unsubscribe token (id) to the configured webhook.
 * Uses UNSUBSCRIBE_WEBHOOK_TEST_URL in development, UNSUBSCRIBE_WEBHOOK_URL otherwise.
 * Does not call webhook unless token passes server-side format validation.
 */
export async function notifyUnsubscribeWebhook(token: string): Promise<void> {
  if (!isValidUnsubscribeToken(token)) {
    return;
  }

  const nodeEnv = process.env.NODE_ENV;
  const testUrl = process.env.UNSUBSCRIBE_WEBHOOK_TEST_URL;
  const prodUrl = process.env.UNSUBSCRIBE_WEBHOOK_URL;
  const webhookUrl =
    nodeEnv === "development" ? testUrl : prodUrl;

  if (!webhookUrl) {
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: token }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status < 200 || res.status >= 300) {
      const body = await res.text();
      console.error(
        "[unsubscribe] webhook failed:",
        res.status,
        res.statusText,
        body ? body.slice(0, 200) : ""
      );
      // 404 = URL not found: check UNSUBSCRIBE_WEBHOOK_TEST_URL / UNSUBSCRIBE_WEBHOOK_URL and that the n8n workflow is active.
    }
  } catch (err) {
    console.error("[unsubscribe] webhook:", err);
  }
}
