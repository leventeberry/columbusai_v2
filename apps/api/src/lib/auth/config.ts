const DEFAULT_COOKIE = "columbus_session";
const DEFAULT_TTL_DAYS = 14;

export function getSessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME?.trim() || DEFAULT_COOKIE;
}

const DEV_FALLBACK_SECRET =
  "dev-only-insecure-session-secret-do-not-use-in-production!!";

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    if (secret) console.warn("[auth] SESSION_SECRET is short; using dev fallback for local only.");
    return DEV_FALLBACK_SECRET;
  }
  throw new Error("SESSION_SECRET must be set and at least 32 characters in production");
}

export function getSessionTtlMs(): number {
  const days = Number(process.env.SESSION_TTL_DAYS ?? DEFAULT_TTL_DAYS);
  return (Number.isFinite(days) && days > 0 ? days : DEFAULT_TTL_DAYS) * 24 * 60 * 60 * 1000;
}

export function getCookieDomain(): string | undefined {
  const d = process.env.COOKIE_DOMAIN?.trim();
  return d || undefined;
}

export function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}
