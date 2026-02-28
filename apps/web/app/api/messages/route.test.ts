import { z } from "zod";
import { NextRequest } from "next/server";
import { POST, GET } from "./route";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn().mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      create: jest.fn().mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440000" }),
    },
    message: {
      create: jest.fn().mockResolvedValue({
        id: "msg-1",
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        role: "user",
        content: "hi",
        created_at: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([{
        id: "msg-1",
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        role: "user",
        content: "hi",
        created_at: new Date(),
      }]),
    },
  },
}));

const postSuccessSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.object({
    id: z.string(),
    conversationId: z.string(),
    role: z.string(),
    content: z.string(),
    createdAt: z.unknown(),
  }),
});

const getSuccessSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    conversationId: z.string(),
    role: z.string(),
    content: z.string(),
    createdAt: z.unknown(),
  })),
});

describe("POST /api/messages", () => {
  it("returns 400 for invalid body (missing content)", async () => {
    const req = new NextRequest("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 and body shape for valid content", async () => {
    const req = new NextRequest("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({ content: "hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = postSuccessSchema.parse(await res.json());
    expect(body.conversationId).toBeDefined();
    expect(body.message.content).toBe("hi");
  });
});

describe("GET /api/messages", () => {
  it("returns 400 when conversationId is missing", async () => {
    const req = new NextRequest("http://localhost/api/messages");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 and messages array for valid conversationId", async () => {
    const req = new NextRequest("http://localhost/api/messages?conversationId=550e8400-e29b-41d4-a716-446655440000");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = getSuccessSchema.parse(await res.json());
    expect(Array.isArray(body.messages)).toBe(true);
    expect(body.messages[0].content).toBe("hi");
  });
});
