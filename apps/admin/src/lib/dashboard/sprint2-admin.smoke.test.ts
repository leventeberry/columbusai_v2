/**
 * Sprint 2 admin smoke checks (adapter + types, no browser).
 * Verifies dashboard wiring for contacted status and live activity mapping.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDashboardActivity, buildAttentionLeads } from "./adapters";
import type { SalesLead } from "@/lib/sales-types";
import type { LeadActivityDto } from "@/lib/sales.functions";

function baseLead(overrides: Partial<SalesLead> = {}): SalesLead {
  const now = new Date("2026-06-04T12:00:00.000Z").toISOString();
  return {
    id: "lead-1",
    createdAt: now,
    updatedAt: now,
    company: "Acme",
    contact: "Jane",
    email: "jane@test.com",
    phone: "",
    service: "AI",
    industry: "",
    status: "contacted",
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
    pipelineStage: "contacted",
    score: 70,
    value: 10_000,
    ...overrides,
  };
}

describe("Sprint 2 admin smoke", () => {
  it("maps real activity events for dashboard feed", () => {
    const events: LeadActivityDto[] = [
      {
        id: "ev-1",
        createdAt: "2026-06-04T11:00:00.000Z",
        leadId: "lead-1",
        type: "status_changed",
        title: "Status changed",
        detail: "new → contacted",
        metadata: { from: "new", to: "contacted" },
      },
    ];
    const activity = buildDashboardActivity(events, []);
    assert.equal(activity[0]?.source, "live");
    assert.equal(activity[0]?.type, "lead");
    assert.equal(activity[0]?.leadId, "lead-1");
  });

  it("includes contacted leads in attention queue when stale", () => {
    const stale = baseLead({
      status: "contacted",
      pipelineStage: "contacted",
      updatedAt: new Date("2026-05-28T12:00:00.000Z").toISOString(),
    });
    const result = buildAttentionLeads([stale]);
    assert.ok(result.some((l) => l.id === "lead-1" && l.reason === "needs_action"));
  });

  it("maps followup_sent events to workflow type", () => {
    const events: LeadActivityDto[] = [
      {
        id: "ev-2",
        createdAt: "2026-06-04T12:00:00.000Z",
        leadId: "lead-1",
        type: "followup_sent",
        title: "Follow-up email sent",
        detail: "Automated follow-up 1 of 2",
        metadata: { source: "n8n", followup_count: 1 },
      },
    ];
    const activity = buildDashboardActivity(events, []);
    assert.equal(activity[0]?.type, "workflow");
  });
});
