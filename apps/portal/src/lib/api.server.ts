import { getRequest } from "@tanstack/react-start/server";

export function getApiBaseUrl(): string {
  return (process.env.API_URL ?? process.env.VITE_API_URL ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const request = getRequest();
  const cookie = request?.headers.get("cookie");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text) as { error?: string };
      message = json.error ?? text;
    } catch {
      /* raw */
    }
    throw new Error(message || `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}
