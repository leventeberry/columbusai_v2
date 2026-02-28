import { z } from "zod";
import { NextRequest } from "next/server";
import { POST } from "./route";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440000" }),
    },
    message: {
      create: jest.fn().mockResolvedValue({ id: "msg-1", conversation_id: "550e8400-e29b-41d4-a716-446655440000", role: "user", content: "hello", openai_response_id: null }),
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([
        { id: "msg-1", conversation_id: "550e8400-e29b-41d4-a716-446655440000", role: "user", content: "hello", openai_response_id: null },
      ]),
    },
  },
}));

const mockResponsesCreate = jest.fn().mockResolvedValue({
  id: "resp-1",
  output_text: "Hi",
  output: [],
  usage: { input_tokens: 0, output_tokens: 0 },
});
jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    responses: { create: mockResponsesCreate },
    embeddings: { create: jest.fn().mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0) }] }) },
  })),
}));

jest.mock("@/lib/vector-db", () => ({
  getVectorDatabaseUrl: jest.fn().mockReturnValue("postgresql://local"),
  getVectorPool: jest.fn(),
  ensureVectorSchema: jest.fn().mockResolvedValue(undefined),
  searchChunks: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/metrics-lite", () => ({
  recordChatMetrics: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 19, resetSeconds: 300 }),
}));

const chatSuccessSchema = z.object({
  conversationId: z.string().uuid(),
  responseId: z.string(),
  text: z.string(),
});

describe("POST /api/chat", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: "sk-test",
      DATABASE_URL: originalEnv.DATABASE_URL ?? "postgresql://columbus:columbus@localhost:5432/columbus",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 400 for invalid body (missing message)", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty message", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 and body shape for valid message", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = chatSuccessSchema.parse(await res.json());
    expect(body.conversationId).toBeDefined();
    expect(body.responseId).toBe("resp-1");
    expect(body.text).toBe("Hi");
  });
});
