/**
 * Default values per environment for .env.*.example files.
 * Keys must stay in sync across local | staging | production.
 */

export type EnvProfile = "local" | "staging" | "production";

export type EnvKeyDef = {
  key: string;
  comment?: string;
  values: Record<EnvProfile, string>;
};

const stagingDomain = "staging.columbusai.tech";
const prodDomain = "columbusai.tech";
const demoWebhookPath = "f7ceff32-3922-4ac8-a522-2b83995e5f04";

function stagingUrl(sub: string): string {
  return `https://${sub}.${stagingDomain}`;
}

function prodUrl(sub: string): string {
  return `https://${sub}.${prodDomain}`;
}

/** Ordered env definitions — same keys in every .env.*.example file. */
export const ENV_KEYS: EnvKeyDef[] = [
  {
    key: "NODE_ENV",
    comment: "Compose also sets NODE_ENV per service; used for host-side Prisma/scripts",
    values: { local: "development", staging: "production", production: "production" },
  },
  {
    key: "POSTGRES_PASSWORD",
    values: {
      local: "columbus",
      staging: "change-me-staging-password",
      production: "change-me-generate-strong-password",
    },
  },
  { key: "DOMAIN", values: { local: "localhost", staging: stagingDomain, production: prodDomain } },
  {
    key: "ACME_EMAIL",
    values: { local: "dev@localhost", staging: `contact@${stagingDomain}`, production: `contact@${prodDomain}` },
  },
  {
    key: "CORS_ORIGIN",
    values: {
      local:
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002,http://localhost:3010,http://127.0.0.1:3010",
      staging: `https://${stagingDomain},https://www.${stagingDomain},${stagingUrl("admin")},${stagingUrl("portal")}`,
      production: `https://${prodDomain},https://www.${prodDomain},https://admin.${prodDomain},https://portal.${prodDomain}`,
    },
  },
  {
    key: "VITE_API_URL",
    values: { local: "http://localhost:4000", staging: stagingUrl("api"), production: prodUrl("api") },
  },
  {
    key: "NEXT_PUBLIC_API_URL",
    values: { local: "http://localhost:4000", staging: stagingUrl("api"), production: prodUrl("api") },
  },
  {
    key: "VITE_ADMIN_URL",
    values: { local: "http://localhost:3002", staging: stagingUrl("admin"), production: prodUrl("admin") },
  },
  {
    key: "DATABASE_URL",
    comment: "Compose overrides hostnames for containers; use localhost for host Prisma on laptop",
    values: {
      local: "postgresql://columbus:columbus@localhost:5432/columbus",
      staging: "postgresql://columbus:change-me-staging-password@postgres:5432/columbus",
      production: "postgresql://columbus:change-me-generate-strong-password@postgres:5432/columbus",
    },
  },
  {
    key: "VECTOR_DATABASE_URL",
    values: {
      local: "postgresql://columbus:columbus@localhost:5433/columbus_vectors",
      staging: "postgresql://columbus:change-me-staging-password@postgres:5432/columbus_vectors",
      production: "postgresql://columbus:change-me-generate-strong-password@postgres:5432/columbus_vectors",
    },
  },
  {
    key: "REDIS_URL",
    values: { local: "redis://localhost:6379", staging: "redis://redis:6379", production: "redis://redis:6379" },
  },
  { key: "LEADS_PATH", comment: "Optional jsonl fallback when DATABASE_URL unset", values: { local: "", staging: "", production: "" } },
  { key: "PORT", values: { local: "4000", staging: "4000", production: "4000" } },
  { key: "OPENAI_API_KEY", values: { local: "sk-your-openai-key", staging: "sk-your-openai-key", production: "sk-your-openai-key" } },
  { key: "OPENAI_MODEL", values: { local: "gpt-4o-mini", staging: "gpt-4o-mini", production: "gpt-4o-mini" } },
  { key: "OPENAI_STORE", values: { local: "true", staging: "true", production: "true" } },
  { key: "OPENAI_EMBED_MODEL", values: { local: "text-embedding-3-small", staging: "text-embedding-3-small", production: "text-embedding-3-small" } },
  { key: "OPENAI_TIMEOUT_MS", values: { local: "30000", staging: "30000", production: "30000" } },
  { key: "RATE_LIMIT_SCOPE", values: { local: "ip", staging: "ip", production: "ip" } },
  { key: "RATE_LIMIT_MAX_REQUESTS", values: { local: "20", staging: "20", production: "20" } },
  { key: "RATE_LIMIT_WINDOW_SECONDS", values: { local: "300", staging: "300", production: "300" } },
  { key: "RETRIEVAL_K", values: { local: "5", staging: "5", production: "5" } },
  {
    key: "VITE_CONTACT_EMAIL",
    values: { local: "contact@columbusai.tech", staging: "contact@columbusai.tech", production: "contact@columbusai.tech" },
  },
  { key: "VITE_CHAT_TITLE", values: { local: "Chexi AI", staging: "Chexi AI", production: "Chexi AI" } },
  {
    key: "VITE_CHAT_WELCOME",
    values: {
      local: "I'm Chexi, your assistant. Ask me anything!",
      staging: "I'm Chexi, your Columbus AI assistant. Ask me anything!",
      production: "I'm Chexi, your Columbus AI assistant. Ask me anything!",
    },
  },
  { key: "VITE_CHEXI_AVATAR_URL", values: { local: "", staging: "", production: "" } },
  {
    key: "VITE_BOOKING_LINK",
    values: {
      local: "https://calendar.app.google/qoVhywJhvCWaBSg69",
      staging: "https://cal.com/columbus-ai/30min",
      production: "https://calendar.app.google/qoVhywJhvCWaBSg69",
    },
  },
  {
    key: "NEXT_PUBLIC_CONTACT_FORM_URL",
    values: {
      local: "http://localhost:4000/api/contact",
      staging: `${stagingUrl("api")}/api/contact`,
      production: `${prodUrl("api")}/api/contact`,
    },
  },
  {
    key: "NEXT_PUBLIC_CONTACT_EMAIL",
    values: { local: "contact@columbusai.tech", staging: "contact@columbusai.tech", production: "contact@columbusai.tech" },
  },
  { key: "NEXT_PUBLIC_CONTACT_PHONE", values: { local: "", staging: "", production: "" } },
  { key: "NEXT_PUBLIC_CHAT_TITLE", values: { local: "Chexi AI", staging: "Chexi AI", production: "Chexi AI" } },
  {
    key: "NEXT_PUBLIC_CHAT_WELCOME",
    values: {
      local: "I'm Chexi, your assistant. Ask me anything!",
      staging: "I'm Chexi, your Columbus AI assistant. Ask me anything!",
      production: "I'm Chexi, your Columbus AI assistant. Ask me anything!",
    },
  },
  { key: "NEXT_PUBLIC_CHEXI_AVATAR_URL", values: { local: "", staging: "", production: "" } },
  {
    key: "NEXT_PUBLIC_BOOKING_LINK",
    values: {
      local: "https://calendar.app.google/qoVhywJhvCWaBSg69",
      staging: "https://cal.com/columbus-ai/30min",
      production: "https://calendar.app.google/qoVhywJhvCWaBSg69",
    },
  },
  {
    key: "N8N_DEMO_WEBHOOK_TEST_URL",
    values: {
      local: `http://localhost:5678/webhook/${demoWebhookPath}`,
      staging: `https://n8n.${stagingDomain}/webhook/${demoWebhookPath}`,
      production: `https://n8n.${prodDomain}/webhook/${demoWebhookPath}`,
    },
  },
  {
    key: "N8N_DEMO_WEBHOOK_URL",
    values: {
      local: `http://localhost:5678/webhook/${demoWebhookPath}`,
      staging: `https://n8n.${stagingDomain}/webhook/${demoWebhookPath}`,
      production: `https://n8n.${prodDomain}/webhook/${demoWebhookPath}`,
    },
  },
  {
    key: "N8N_WEBHOOK_URL",
    values: {
      local: `http://localhost:5678/webhook/${demoWebhookPath}`,
      staging: `https://n8n.${stagingDomain}/webhook/${demoWebhookPath}`,
      production: `https://n8n.${prodDomain}/webhook/${demoWebhookPath}`,
    },
  },
  {
    key: "N8N_WEBHOOK_TEST_URL",
    values: {
      local: `http://localhost:5678/webhook-test/${demoWebhookPath}`,
      staging: `https://n8n.${stagingDomain}/webhook-test/${demoWebhookPath}`,
      production: `https://n8n.${prodDomain}/webhook-test/${demoWebhookPath}`,
    },
  },
  {
    key: "BOOKING_LINK",
    values: {
      local: "https://calendar.app.google/qoVhywJhvCWaBSg69",
      staging: "https://cal.com/columbus-ai/30min",
      production: "https://calendar.app.google/qoVhywJhvCWaBSg69",
    },
  },
  { key: "UNSUBSCRIBE_WEBHOOK_URL", values: { local: "", staging: "", production: "" } },
  { key: "UNSUBSCRIBE_WEBHOOK_TEST_URL", values: { local: "", staging: "", production: "" } },
  { key: "N8N_BASIC_AUTH_ACTIVE", values: { local: "true", staging: "true", production: "true" } },
  { key: "N8N_BASIC_AUTH_USER", values: { local: "admin", staging: "admin", production: "admin" } },
  {
    key: "N8N_BASIC_AUTH_PASSWORD",
    values: { local: "changeme", staging: "change-me-staging-n8n-password", production: "change-me-strong-password" },
  },
  {
    key: "N8N_DEMO_WORKFLOW_ID",
    comment: "From pnpm n8n:list — not the webhook path UUID",
    values: { local: "gEEYTVQe39iBRra3", staging: "", production: "gEEYTVQe39iBRra3" },
  },
  { key: "N8N_DEMO_FOLLOWUP_WORKFLOW_ID", values: { local: "", staging: "", production: "" } },
  { key: "FOLLOWUP_WAIT_1_MINUTES", values: { local: "1", staging: "60", production: "1440" } },
  { key: "FOLLOWUP_WAIT_2_MINUTES", values: { local: "2", staging: "120", production: "2880" } },
  {
    key: "DEFAULT_FOLLOWUP_TEMPLATE",
    values: { local: "", staging: "", production: "" },
    comment: "Optional: 2day | 7day | 14day — multi-touch registry templates; unset = legacy 2-email flow",
  },
  {
    key: "N8N_API_URL",
    values: {
      local: "http://localhost:5678",
      staging: `https://n8n.${stagingDomain}`,
      production: `https://n8n.${prodDomain}`,
    },
  },
  { key: "N8N_API_KEY", values: { local: "", staging: "", production: "" } },
  { key: "GENERIC_TIMEZONE", values: { local: "America/New_York", staging: "America/New_York", production: "America/New_York" } },
  {
    key: "COLUMBUS_API_URL",
    comment: "n8n container → API (compose sets http://api:4000)",
    values: { local: "http://api:4000", staging: "http://api:4000", production: "http://api:4000" },
  },
  {
    key: "API_URL",
    comment: "portal/admin server-side (compose overrides in Docker)",
    values: { local: "http://localhost:4000", staging: "http://api:4000", production: "http://api:4000" },
  },
  {
    key: "SALES_API_URL",
    values: { local: "http://localhost:4000", staging: "http://api:4000", production: "http://api:4000" },
  },
  { key: "CURSOR_API_KEY", values: { local: "", staging: "", production: "" } },
  { key: "HERMES_SLACK_WEBHOOK_URL", values: { local: "", staging: "", production: "" } },
  { key: "HERMES_GITHUB_ISSUE_NUMBER", values: { local: "", staging: "", production: "" } },
  { key: "GITHUB_REPOSITORY", values: { local: "", staging: "", production: "" } },
  { key: "GITHUB_TOKEN", values: { local: "", staging: "", production: "" } },
  { key: "ADMIN_API_TOKEN", values: { local: "", staging: "", production: "" } },
  {
    key: "SESSION_SECRET",
    values: {
      local: "dev-only-insecure-session-secret-do-not-use-in-production!!",
      staging: "change-me-staging-session-secret-at-least-32-chars",
      production: "change-me-generate-a-long-random-string-at-least-32-chars",
    },
  },
  { key: "SESSION_COOKIE_NAME", values: { local: "columbus_session", staging: "columbus_session", production: "columbus_session" } },
  { key: "SESSION_TTL_DAYS", values: { local: "14", staging: "14", production: "14" } },
  {
    key: "COOKIE_DOMAIN",
    values: { local: "", staging: `.${stagingDomain}`, production: `.${prodDomain}` },
  },
  { key: "SEED_ADMIN_EMAIL", values: { local: "admin@columbusai.com", staging: "admin@columbusai.com", production: "admin@columbusai.com" } },
  {
    key: "SEED_ADMIN_PASSWORD",
    values: { local: "change-me-strong-password", staging: "change-me-staging-seed-password", production: "change-me-strong-password" },
  },
  { key: "DEV_MOCK_PORTAL", values: { local: "false", staging: "false", production: "false" } },
  { key: "VITE_DEV_MOCK_PORTAL", values: { local: "false", staging: "false", production: "false" } },
  {
    key: "HOSTINGER_API_TOKEN",
    comment: "Laptop deploy scripts only — never commit",
    values: { local: "", staging: "", production: "" },
  },
  { key: "HOSTINGER_VPS_IP", values: { local: "147.93.113.58", staging: "", production: "147.93.113.58" } },
  { key: "HOSTINGER_DOMAIN", values: { local: prodDomain, staging: stagingDomain, production: prodDomain } },
  { key: "HOSTINGER_SSH_PUBLIC_KEY_PATH", values: { local: "~/.ssh/id_ed25519.pub", staging: "", production: "~/.ssh/id_ed25519.pub" } },
  { key: "HOSTINGER_SSH_KEY_NAME", values: { local: "columbusai-deploy", staging: "", production: "columbusai-deploy" } },
  {
    key: "HOSTINGER_GITHUB_COMPOSE_URL",
    values: {
      local: "https://github.com/leventeberry/columbusai_v2",
      staging: "",
      production: "https://github.com/leventeberry/columbusai_v2",
    },
  },
  {
    key: "HOSTINGER_DOCKER_PROJECT_NAME",
    values: { local: "columbusai-prod", staging: "columbusai-staging", production: "columbusai-prod" },
  },
  {
    key: "HOSTINGER_FIREWALL_NAME",
    values: { local: "columbusai-prod", staging: "columbusai-staging", production: "columbusai-prod" },
  },
];

export const PROFILE_FILES: Record<EnvProfile, string> = {
  local: ".env.local.example",
  staging: ".env.staging.example",
  production: ".env.production.example",
};

export const LIVE_FILES: Record<EnvProfile, string> = {
  local: ".env.local",
  staging: ".env.staging",
  production: ".env.production",
};
