import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, getDefaultRateLimitMode } from "./rateLimit.js";

const prevEnv = { ...process.env };

describe("rateLimit", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
    process.env.NODE_ENV = "test";
    process.env.RATE_LIMIT_MODE = "fail_closed";
  });

  afterEach(() => {
    process.env = { ...prevEnv };
  });

  it("defaults to fail_closed in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.RATE_LIMIT_MODE;
    assert.equal(getDefaultRateLimitMode(), "fail_closed");
  });

  it("denies when redis is unavailable and mode is fail_closed", async () => {
    const result = await rateLimit({
      key: "rl:test:ip:127.0.0.1",
      limit: 5,
      windowSeconds: 60,
      mode: "fail_closed",
    });
    assert.equal(result.allowed, false);
    assert.equal(result.degraded, true);
  });

  it("allows when redis is unavailable and mode is fail_open", async () => {
    const result = await rateLimit({
      key: "rl:test:ip:127.0.0.1",
      limit: 5,
      windowSeconds: 60,
      mode: "fail_open",
    });
    assert.equal(result.allowed, true);
  });
});
