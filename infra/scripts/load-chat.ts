#!/usr/bin/env npx tsx
/**
 * Phase 6: Lightweight load test for POST /api/chat.
 * Usage:
 *   BASE_URL=http://localhost:3000 CONCURRENCY=10 REQUESTS=100 npx tsx infra/scripts/load-chat.ts
 *   CONVERSATION_ID=<uuid>  optional; otherwise each run creates a new conversation
 *   SPOOF_IPS=1             optional; rotate x-forwarded-for to simulate different IPs
 *
 * Runs from repo root or apps/web (paths work from both).
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const CONCURRENCY = Math.max(1, parseInt(process.env.CONCURRENCY ?? "10", 10) || 10);
const REQUESTS = Math.max(1, parseInt(process.env.REQUESTS ?? "100", 10) || 100);
const CONVERSATION_ID = process.env.CONVERSATION_ID ?? undefined;
const SPOOF_IPS = process.env.SPOOF_IPS === "1" || process.env.SPOOF_IPS === "true";

interface Result {
  status: number;
  latencyMs: number;
  ok: boolean;
}

async function oneRequest(
  url: string,
  body: { message: string; conversationId?: string },
  requestIndex: number
): Promise<Result> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (SPOOF_IPS) {
    const octet = (requestIndex % 254) + 1;
    headers["x-forwarded-for"] = `192.168.1.${octet}`;
  }
  const start = Date.now();
  let status = 0;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    status = res.status;
    await res.text();
  } catch (e) {
    status = 0;
  }
  const latencyMs = Date.now() - start;
  return { status, latencyMs, ok: status >= 200 && status < 300 };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);
}

async function main(): Promise<void> {
  const url = BASE_URL.replace(/\/$/, "") + "/api/chat";
  let conversationId = CONVERSATION_ID;

  if (!conversationId) {
    const createRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "ping" }),
    });
    if (!createRes.ok) {
      console.error("Failed to create conversation:", createRes.status, await createRes.text());
      process.exit(1);
    }
    const data = (await createRes.json()) as { conversationId?: string };
    conversationId = data.conversationId;
    if (!conversationId) {
      console.error("No conversationId in response");
      process.exit(1);
    }
  }

  const body = { message: "Load test message", conversationId };
  const results: Result[] = [];
  const run = async (index: number) => {
    const r = await oneRequest(url, body, index);
    results.push(r);
  };

  const start = Date.now();
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => {
    const tasks: Promise<void>[] = [];
    for (let j = i; j < REQUESTS; j += CONCURRENCY) {
      tasks.push(run(j));
    }
    return Promise.all(tasks);
  });
  await Promise.all(workers);
  const totalMs = Date.now() - start;

  const success = results.filter((r) => r.ok).length;
  const rate429 = results.filter((r) => r.status === 429).length;
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const avg = latencies.length ? latencies.reduce((s, n) => s + n, 0) / latencies.length : 0;
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);

  console.log("--- load-chat summary ---");
  console.log("BASE_URL:", BASE_URL);
  console.log("CONCURRENCY:", CONCURRENCY);
  console.log("REQUESTS:", REQUESTS);
  console.log("success %:", ((100 * success) / REQUESTS).toFixed(2));
  console.log("429 %:", ((100 * rate429) / REQUESTS).toFixed(2));
  console.log("avg latency (ms):", Math.round(avg));
  console.log("p50 latency (ms):", Math.round(p50));
  console.log("p95 latency (ms):", Math.round(p95));
  console.log("total wall (ms):", totalMs);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
