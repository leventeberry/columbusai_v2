import { z } from "zod";
import { GET } from "./route";

const healthSchema = z.object({ ok: z.literal(true) });

describe("GET /api/health", () => {
  it("returns 200 and ok: true", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = healthSchema.parse(await res.json());
    expect(body.ok).toBe(true);
  });
});
