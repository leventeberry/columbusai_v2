/**
 * Validated web env. In production (server-only) requires NEXT_PUBLIC_API_URL
 * and forbids localhost/127.0.0.1. Never log secret values.
 */

export interface WebEnv {
  nextPublicApiUrl: string;
}

let cached: WebEnv | null = null;
let warnedDev = false;

function isServer(): boolean {
  return typeof window === "undefined";
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function failProd(message: string): never {
  console.error(message);
  process.exit(1);
}

export function getWebEnv(): WebEnv {
  if (cached) return cached;

  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = raw.trim();

  const effectiveUrl =
    !isProd() && url === "" ? "http://localhost:4000" : url;

  if (isServer() && isProd()) {
    if (!effectiveUrl) {
      failProd(
        "[env] In production NEXT_PUBLIC_API_URL is required. Example: NEXT_PUBLIC_API_URL=https://api.example.com"
      );
    }
    const lower = effectiveUrl.toLowerCase();
    if (lower.includes("localhost") || lower.includes("127.0.0.1")) {
      failProd(
        "[env] In production NEXT_PUBLIC_API_URL must not contain localhost or 127.0.0.1. Example: NEXT_PUBLIC_API_URL=https://api.example.com"
      );
    }
  } else if (isServer() && !effectiveUrl && !warnedDev) {
    console.warn(
      "[env] NEXT_PUBLIC_API_URL is unset; API_BASE will be empty. Set it for the chatbot (e.g. http://localhost:4000)."
    );
    warnedDev = true;
  }

  cached = { nextPublicApiUrl: effectiveUrl };
  return cached;
}
