import crypto from "node:crypto";

const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export function getWidgetSessionSecret(): string {
  const secret = process.env.WIDGET_SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return process.env.WIDGET_SESSION_SECRET?.trim() || "dev-only-widget-session-secret-32chars!!";
  }
  throw new Error("WIDGET_SESSION_SECRET must be set and at least 32 characters in production");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getWidgetSessionSecret()).update(payload).digest("base64url");
}

export function createWidgetToken(conversationId: string, ttlMs = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = Buffer.from(JSON.stringify({ conversationId, exp }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyWidgetToken(
  token: string,
  expectedConversationId: string,
): { ok: true } | { ok: false; reason: string } {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid_format" };
  const [payload, sig] = parts;
  if (!payload || !sig || sign(payload) !== sig) return { ok: false, reason: "invalid_signature" };
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      conversationId?: string;
      exp?: number;
    };
    if (!parsed.conversationId || parsed.conversationId !== expectedConversationId) {
      return { ok: false, reason: "conversation_mismatch" };
    }
    if (!parsed.exp || typeof parsed.exp !== "number" || parsed.exp < Date.now()) {
      return { ok: false, reason: "expired" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }
}
