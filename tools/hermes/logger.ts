import fs from "node:fs";

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export type LogPayload = Record<string, JsonValue>;

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function appendNdjson(filePath: string, payload: LogPayload) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...payload,
  });
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

