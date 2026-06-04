import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const loginSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "login.ts"),
  "utf8",
);

describe("postAuthLogin", () => {
  it("does not return sessionToken in JSON body", () => {
    assert.ok(!loginSource.includes("sessionToken:"));
  });

  it("applies rate limiting", () => {
    assert.ok(loginSource.includes("applyRateLimitPreset"));
  });
});
