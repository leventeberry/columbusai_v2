/**
 * Sprint 2 API smoke tests against a real database.
 * Run: pnpm --filter api test:integration
 * Requires: Postgres up, migrations applied, ADMIN_API_TOKEN and DATABASE_URL in env.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
dotenv.config({ path: path.join(repoRoot, ".env.local") });
// Avoid Redis connection retries hanging the test process when Redis is down.
delete process.env.REDIS_URL;

const runIntegration = process.env.INTEGRATION_TEST === "1";
const adminToken = process.env.ADMIN_API_TOKEN?.trim();

function adminHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": adminToken ?? "",
  };
}

describe("Sprint 2 leads workflow (integration)", { skip: !runIntegration }, () => {
  let server: Server;
  let baseUrl = "";
  let leadId = "";
  let createApp: typeof import("../../app.js").createApp;
  let prisma: typeof import("../../lib/prisma.js").prisma;

  before(async () => {
    if (!adminToken) {
      throw new Error("ADMIN_API_TOKEN is required for integration tests");
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for integration tests");
    }

    ({ createApp } = await import("../../app.js"));
    ({ prisma } = await import("../../lib/prisma.js"));

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new Error("Database is not reachable — start Postgres and apply migrations");
    }

    const app = createApp();
    await new Promise<void>((resolve, reject) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        if (!addr || typeof addr === "string") {
          reject(new Error("Failed to bind test server"));
          return;
        }
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it("POST /api/leads creates lead with status new", async () => {
    const res = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        fname: "Smoke",
        lname: "Test",
        email: `sprint2-smoke-${Date.now()}@columbus.test`,
        whatAutomate: "Integration test automation",
        company: "Sprint2 Co",
      }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { lead: { id: string; status: string } };
    leadId = body.lead.id;
    assert.ok(leadId);
    assert.equal(body.lead.status, "new");
  });

  it("records lead_created activity event", async () => {
    const events = await prisma.salesLeadActivity.findMany({
      where: { leadId, type: "lead_created" },
    });
    assert.ok(events.length >= 1);
  });

  it("PATCH /api/leads/:id/status to contacted succeeds", async () => {
    const res = await fetch(`${baseUrl}/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ status: "contacted" }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { lead: { status: string } };
    assert.equal(body.lead.status, "contacted");
  });

  it("records status_changed activity event", async () => {
    const events = await prisma.salesLeadActivity.findMany({
      where: { leadId, type: "status_changed" },
    });
    assert.ok(events.length >= 1);
    const meta = events[0]?.metadata as { from?: string; to?: string } | null;
    assert.equal(meta?.from, "new");
    assert.equal(meta?.to, "contacted");
  });

  it("PATCH /api/leads/:id/notes succeeds", async () => {
    const res = await fetch(`${baseUrl}/api/leads/${leadId}/notes`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ notes: "Sprint 2 smoke test note" }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { lead: { notes: string } };
    assert.equal(body.lead.notes, "Sprint 2 smoke test note");
  });

  it("records note_updated activity event", async () => {
    const events = await prisma.salesLeadActivity.findMany({
      where: { leadId, type: "note_updated" },
    });
    assert.ok(events.length >= 1);
  });

  it("GET /api/leads/:id/activity returns events", async () => {
    const res = await fetch(`${baseUrl}/api/leads/${leadId}/activity`, {
      headers: adminHeaders(),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { activity: { type: string }[] };
    assert.ok(body.activity.length >= 3);
    const types = new Set(body.activity.map((a) => a.type));
    assert.ok(types.has("lead_created"));
    assert.ok(types.has("status_changed"));
    assert.ok(types.has("note_updated"));
  });

  it("GET /api/activity/recent returns global events", async () => {
    const res = await fetch(`${baseUrl}/api/activity/recent`, {
      headers: adminHeaders(),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { activity: { leadId: string }[] };
    assert.ok(body.activity.some((a) => a.leadId === leadId));
  });

  it("SalesLead relation includes activity rows", async () => {
    const lead = await prisma.salesLead.findUnique({
      where: { id: leadId },
      include: { activity: { take: 5 } },
    });
    assert.ok(lead);
    assert.ok(lead.activity.length >= 3);
  });

  it("POST /api/leads/:id/convert-to-opportunity records lead_converted activity", async () => {
    const res = await fetch(`${baseUrl}/api/leads/${leadId}/convert-to-opportunity`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ stage: "qualified" }),
    });
    assert.equal(res.status, 201);
    const events = await prisma.salesLeadActivity.findMany({
      where: { leadId, type: "lead_converted" },
    });
    assert.ok(events.length >= 1);
  });
});
