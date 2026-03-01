/**
 * In-memory metrics for /api/chat. Module-level singleton.
 */
const BUCKETS_MS = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000];

interface MetricsState {
  chat_requests_total: number;
  chat_429_total: number;
  chat_5xx_total: number;
  chat_2xx_total: number;
  latency_ms_buckets: Record<string, number>;
  latency_ms_sum: number;
  latency_ms_count: number;
}

const state: MetricsState = {
  chat_requests_total: 0,
  chat_429_total: 0,
  chat_5xx_total: 0,
  chat_2xx_total: 0,
  latency_ms_buckets: Object.fromEntries(BUCKETS_MS.map((b) => [String(b), 0])),
  latency_ms_sum: 0,
  latency_ms_count: 0,
};

function bucketKey(ms: number): string {
  for (let i = BUCKETS_MS.length - 1; i >= 0; i--) {
    if (ms >= BUCKETS_MS[i]) return String(BUCKETS_MS[i]);
  }
  return String(BUCKETS_MS[0]);
}

export function recordChatMetrics(status: number, latencyMs: number): void {
  state.chat_requests_total += 1;
  if (status === 429) state.chat_429_total += 1;
  else if (status >= 500) state.chat_5xx_total += 1;
  else if (status >= 200 && status < 300) state.chat_2xx_total += 1;

  state.latency_ms_sum += latencyMs;
  state.latency_ms_count += 1;
  const key = bucketKey(latencyMs);
  state.latency_ms_buckets[key] = (state.latency_ms_buckets[key] ?? 0) + 1;
}
