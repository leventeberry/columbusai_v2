import { createHash, randomBytes } from "node:crypto";
import { getSessionSecret } from "./config.js";

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(`${getSessionSecret()}:${token}`).digest("hex");
}
