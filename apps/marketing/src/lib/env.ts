/**
 * Public client env (VITE_*). Never put secrets here.
 */

function readVite(key: string): string {
  const raw = import.meta.env[key];
  return typeof raw === "string" ? raw.trim() : "";
}

export function getApiBaseUrl(): string {
  const url =
    readVite("VITE_API_URL") ||
    readVite("VITE_NEXT_PUBLIC_API_URL") ||
    "";
  if (url) return url.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:4000";
  return "";
}

export const CHAT_TITLE =
  readVite("VITE_CHAT_TITLE") || "Chexi AI";

export const CHAT_WELCOME =
  readVite("VITE_CHAT_WELCOME") ||
  "I'm Chexi, your Columbus AI assistant. Ask me anything!";

export const CHEXI_AVATAR_URL = readVite("VITE_CHEXI_AVATAR_URL") || "";

export const CONTACT_EMAIL =
  readVite("VITE_CONTACT_EMAIL") || "contact@columbusai.tech";

export const BOOKING_LINK =
  readVite("VITE_BOOKING_LINK") || "https://cal.com/columbus-ai/30min";

/** Columbus AI operator dashboard (separate TanStack Start app). */
export function getAdminUrl(): string {
  const url = readVite("VITE_ADMIN_URL");
  if (url) return url.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3002";
  return "https://admin.columbusai.tech";
}

export function getAdminLoginUrl(): string {
  return `${getAdminUrl()}/login`;
}
