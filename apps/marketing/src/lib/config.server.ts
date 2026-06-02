import process from "node:process";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    leadsPath: process.env.LEADS_PATH,
    n8nWebhookUrl:
      process.env.NODE_ENV === "development"
        ? process.env.N8N_DEMO_WEBHOOK_TEST_URL
        : process.env.N8N_DEMO_WEBHOOK_URL,
    bookingLink: process.env.BOOKING_LINK,
    unsubscribeWebhookUrl:
      process.env.NODE_ENV === "development"
        ? process.env.UNSUBSCRIBE_WEBHOOK_TEST_URL
        : process.env.UNSUBSCRIBE_WEBHOOK_URL,
  };
}
