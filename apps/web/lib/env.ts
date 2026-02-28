/**
 * Required env vars for /api/chat. Used to return 500 with a safe message
 * and log missing keys (never log values).
 */
const REQUIRED_CHAT_KEYS = ["OPENAI_API_KEY", "DATABASE_URL"] as const;

export function getMissingRequiredEnv(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_CHAT_KEYS) {
    const value = process.env[key];
    if (value === undefined || value === "") missing.push(key);
  }
  return missing;
}
