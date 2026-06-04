import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWidgetToken, verifyWidgetToken } from "./widgetToken.js";

process.env.WIDGET_SESSION_SECRET = "test-widget-session-secret-32chars!!";

describe("widgetToken", () => {
  it("issues and verifies a matching conversation token", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const token = createWidgetToken(id);
    assert.equal(verifyWidgetToken(token, id).ok, true);
  });

  it("rejects token for a different conversation", () => {
    const token = createWidgetToken("550e8400-e29b-41d4-a716-446655440000");
    const result = verifyWidgetToken(token, "550e8400-e29b-41d4-a716-446655440001");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "conversation_mismatch");
  });

  it("rejects tampered signature", () => {
    const token = createWidgetToken("550e8400-e29b-41d4-a716-446655440000");
    const bad = `${token}x`;
    assert.equal(verifyWidgetToken(bad, "550e8400-e29b-41d4-a716-446655440000").ok, false);
  });
});
