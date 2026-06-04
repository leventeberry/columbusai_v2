import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWidgetToken, verifyWidgetToken } from "../lib/chat/widgetToken.js";

process.env.WIDGET_SESSION_SECRET = "test-widget-session-secret-32chars!!";

const convA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

describe("chat conversation access tokens", () => {
  it("wrong token cannot access conversation messages", () => {
    const convB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    const tokenA = createWidgetToken(convA);
    assert.equal(verifyWidgetToken(tokenA, convB).ok, false);
  });

  it("empty token is rejected", () => {
    assert.equal(verifyWidgetToken("", convA).ok, false);
  });
});
