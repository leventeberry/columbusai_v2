/**
 * Redis-backed rate limiter (fixed window, atomic via Lua).
 */
import type { Request, Response } from "express";
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
let degradedLogged = false;

export type RateLimitMode = "fail_open" | "fail_closed";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  degraded?: boolean;
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
  mode?: RateLimitMode;
}

export const RATE_LIMIT_PRESETS = {
  login: { limit: 10, windowSeconds: 900 },
  leadsDemo: { limit: 10, windowSeconds: 300 },
  chat: { limit: 20, windowSeconds: 300 },
  messages: { limit: 60, windowSeconds: 300 },
  adminToken: { limit: 120, windowSeconds: 300 },
} as const;

export function getDefaultRateLimitMode(): RateLimitMode {
  if (process.env.RATE_LIMIT_MODE === "fail_open") return "fail_open";
  if (process.env.NODE_ENV === "production") return "fail_closed";
  return process.env.REDIS_URL?.trim() ? "fail_closed" : "fail_open";
}

export function logRateLimitDegraded(reason: string, detail?: Record<string, unknown>): void {
  if (degradedLogged && process.env.NODE_ENV === "production") return;
  degradedLogged = true;
  console.error(
    JSON.stringify({
      level: "error",
      message: "rate_limit_degraded",
      reason,
      fail_closed: getDefaultRateLimitMode() === "fail_closed",
      ...detail,
    }),
  );
}

function getClient(): RedisClientType | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!_client) {
    _client = createClient({ url });
    _client.on("error", (err) => console.warn("[rateLimit] Redis error:", err));
  }
  return _client;
}

async function ensureConnected(client: RedisClientType): Promise<void> {
  if (!client.isOpen) await client.connect();
}

function deniedResult(limit: number, windowSeconds: number, degraded: boolean): RateLimitResult {
  return { allowed: false, remaining: 0, resetSeconds: windowSeconds, degraded };
}

function allowedFallback(limit: number, windowSeconds: number): RateLimitResult {
  return { allowed: true, remaining: limit, resetSeconds: windowSeconds };
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const mode = options.mode ?? getDefaultRateLimitMode();
  const client = getClient();

  if (!client) {
    logRateLimitDegraded("redis_unconfigured", { key });
    if (mode === "fail_closed") return deniedResult(limit, windowSeconds, true);
    return allowedFallback(limit, windowSeconds);
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
    logRateLimitDegraded("redis_error", { key, error: String(e) });
    if (mode === "fail_closed") return deniedResult(limit, windowSeconds, true);
    return allowedFallback(limit, windowSeconds);
  }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  return (
    (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : null) ??
    req.ip ??
    "unknown"
  );
}

export async function applyRateLimitPreset(
  req: Request,
  res: Response,
  preset: keyof typeof RATE_LIMIT_PRESETS,
  keySuffix = "",
): Promise<boolean> {
  const { limit, windowSeconds } = RATE_LIMIT_PRESETS[preset];
  const key = `rl:${preset}:ip:${clientIp(req)}${keySuffix}`;
  const rl = await rateLimit({ key, limit, windowSeconds });
  if (!rl.allowed) {
    const status = rl.degraded && getDefaultRateLimitMode() === "fail_closed" ? 503 : 429;
    const message =
      status === 503
        ? "Service temporarily unavailable"
        : "Rate limit exceeded. Please try again shortly.";
    res
      .status(status)
      .set({
        "Retry-After": String(rl.resetSeconds),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
      })
      .json({ error: message });
    return false;
  }
  res.set({
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(rl.remaining),
  });
  return true;
}
