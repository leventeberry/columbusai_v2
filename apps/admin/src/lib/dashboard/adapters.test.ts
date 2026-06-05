import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SalesLead } from "@/lib/sales-types";
import {
  ATTENTION_QUEUE_LIMIT,
  buildAttentionLeads,
  buildDashboardActivity,
  buildDashboardKpis,
  buildDashboardTasks,
  deriveTasksFromLeads,
} from "./adapters";
import { formatRelativeTime } from "./format";

function baseLead(overrides: Partial<SalesLead> = {}): SalesLead {
  const now = new Date("2026-06-04T12:00:00.000Z");
  return {
    id: "lead-1",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    company: "Acme Corp",
    contact: "Jane Doe",
    email: "jane@acme.test",
    phone: "",
    service: "AI automation",
    industry: "tech",
    status: "new",
    notes: null,
    summary: null,
    priority: null,
    confidence: null,
    recommendedNextStep: null,
    followupCount: 0,
    lastFollowupAt: null,
    nextFollowupAt: null,
    followupTemplate: null,
    opportunityId: null,
    pipelineStage: "new",
    score: 70,
    value: 10_000,
    ...overrides,
  };
}

describe("buildAttentionLeads", () => {
  it("caps results at ATTENTION_QUEUE_LIMIT", () => {
    const leads = Array.from({ length: 20 }, (_, i) =>
      baseLead({
        id: `lead-${i}`,
        company: `Co ${i}`,
        nextFollowupAt: new Date("2026-06-03T12:00:00.000Z").toISOString(),
      }),
    );
    const result = buildAttentionLeads(leads);
    assert.equal(result.length, ATTENTION_QUEUE_LIMIT);
    assert.equal(ATTENTION_QUEUE_LIMIT, 8);
  });

  it("prioritizes overdue follow-up over new leads", () => {
    const overdue = baseLead({
      id: "overdue",
      nextFollowupAt: new Date("2026-06-03T12:00:00.000Z").toISOString(),
    });
    const fresh = baseLead({
      id: "new",
      createdAt: new Date("2026-06-04T10:00:00.000Z").toISOString(),
      status: "new",
    });
    const result = buildAttentionLeads([fresh, overdue]);
    assert.equal(result[0]?.id, "overdue");
    assert.equal(result[0]?.reason, "overdue_followup");
  });
});

describe("buildDashboardKpis", () => {
  it("labels tasks KPI source as derived", () => {
    const leads = [
      baseLead({
        nextFollowupAt: new Date("2026-06-04T14:00:00.000Z").toISOString(),
      }),
    ];
    const tasks = buildDashboardTasks(leads);
    const kpis = buildDashboardKpis({ openLeads: 1, activeClients: 2, pipelineValue: 50_000 }, leads, tasks);
    assert.equal(kpis.tasksDueToday.source, "derived");
    assert.ok(kpis.tasksDueToday.value >= 1);
  });

  it("does not include mock unread messages KPI", () => {
    const kpis = buildDashboardKpis(null, [], []);
    assert.equal("unreadMessages" in kpis, false);
  });
});

describe("buildDashboardTasks", () => {
  it("uses only derived follow-up tasks", () => {
    const tasks = buildDashboardTasks([]);
    assert.equal(tasks.length, 0);
  });
});

describe("deriveTasksFromLeads", () => {
  it("includes overdue follow-ups", () => {
    const tasks = deriveTasksFromLeads([
      baseLead({
        nextFollowupAt: new Date("2026-06-03T08:00:00.000Z").toISOString(),
      }),
    ]);
    assert.ok(tasks.some((t) => t.status === "overdue"));
  });
});

describe("buildDashboardActivity", () => {
  it("uses real events when provided", () => {
    const events = [
      {
        id: "ev-1",
        createdAt: "2026-06-04T11:50:00.000Z",
        leadId: "lead-1",
        type: "lead_created",
        title: "Lead created",
        detail: "Jane Doe — AI automation",
        metadata: null,
      },
    ];
    const result = buildDashboardActivity(events, []);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.source, "live");
    assert.equal(result[0]?.type, "lead");
    assert.equal(result[0]?.title, "Lead created");
  });

  it("falls back to leads when no real events", () => {
    const leads = [baseLead()];
    const result = buildDashboardActivity(undefined, leads);
    assert.ok(result.length > 0);
    assert.ok(result[0]?.title.includes("Lead updated"));
  });
});

describe("formatRelativeTime", () => {
  it("formats minutes ago", () => {
    const now = Date.parse("2026-06-04T12:00:00.000Z");
    const iso = new Date(now - 5 * 60_000).toISOString();
    assert.equal(formatRelativeTime(iso, now), "5m ago");
  });
});
