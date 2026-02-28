/**
 * In-memory per-IP rate limit for contact form submissions.
 * Limit: 10 requests per minute per key (e.g. IP).
 */

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export function checkContactRateLimit(key: string): boolean {
  prune();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}
