/**
 * Redis-backed rate limiter (fixed window, atomic via Lua).
 * When REDIS_URL is unset, allows all requests (no-op) so dev/test without Redis still works.
 */
import { createClient, type RedisClientType } from "redis";

const FIXED_WINDOW_LUA = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {c, ttl}
`;

let _client: RedisClientType | null = null;

function getClient(): RedisClientType | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!_client) {
    _client = createClient({ url });
    _client.on("error", (err) => console.warn("[rateLimit] Redis error:", err));
    // Lazy connect on first use; do not block module load
  }
  return _client;
}

async function ensureConnected(client: RedisClientType): Promise<void> {
  if (!client.isOpen) await client.connect();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Check and increment rate limit. Uses fixed window (Lua: INCR + EXPIRE on first).
 * When REDIS_URL is unset, returns allowed: true so callers proceed without Redis.
 */
export async function rateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const client = getClient();
  if (!client) {
    return {
      allowed: true,
      remaining: limit,
      resetSeconds: windowSeconds,
    };
  }
  try {
    await ensureConnected(client);
    const result = await client.eval(FIXED_WINDOW_LUA, {
      keys: [key],
      arguments: [String(windowSeconds)],
    });
    const [count, ttl] = Array.isArray(result) ? result : [0, 0];
    const n = Number(count) ?? 0;
    const resetSeconds = Math.max(0, Number(ttl) ?? 0);
    const allowed = n <= limit;
    const remaining = Math.max(0, limit - n);
    return { allowed, remaining, resetSeconds };
  } catch (e) {
    console.warn("[rateLimit] Redis check failed, allowing request:", e);
    return {
      allowed: true,
      remaining: limit,
      resetSeconds: windowSeconds,
    };
  }
}
