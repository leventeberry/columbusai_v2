/**
 * Validates unsubscribe token format server-side before calling webhook.
 * Rejects empty, too-short, or obviously invalid tokens to reduce enumeration risk.
 */
const MIN_TOKEN_LENGTH = 16;
const MAX_TOKEN_LENGTH = 512;

export function isValidUnsubscribeToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const t = token.trim();
  if (t.length < MIN_TOKEN_LENGTH || t.length > MAX_TOKEN_LENGTH) return false;
  // Reject control chars and non-printable
  if (/[\x00-\x1f\x7f]/.test(t)) return false;
  return true;
}
