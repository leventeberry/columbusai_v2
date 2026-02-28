import { postChatBodySchema } from "./schemas";

describe("postChatBodySchema", () => {
  it("accepts valid payload with message only", () => {
    const result = postChatBodySchema.safeParse({ message: "hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("hello");
      expect(result.data.conversationId).toBeUndefined();
    }
  });

  it("accepts valid payload with conversationId and message", () => {
    const result = postChatBodySchema.safeParse({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      message: "hi",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversationId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.data.message).toBe("hi");
    }
  });

  it("rejects missing message", () => {
    const result = postChatBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = postChatBodySchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid conversationId (not UUID)", () => {
    const result = postChatBodySchema.safeParse({
      conversationId: "not-a-uuid",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });
});
