/**
 * Dashboard data adapters — UI reads via useDashboardOperations().
 *
 * Swap points:
 * - Inbox KPI → unified inbox API (removed in Sprint 3 until real)
 * - Activity feed via GET /api/activity/recent
 * - deriveTasksFromLeads supplies follow-up tasks from live leads
 */
import type { SalesLead } from "@/lib/sales-types";
import type { LeadActivityDto } from "@/lib/sales.functions";
import { formatRelativeTime } from "./format";
import type {
  AttentionLead,
  AttentionReason,
  DashboardActivity,
  DashboardKpis,
  DashboardTask,
  DataSource,
} from "./types";

export const ATTENTION_QUEUE_LIMIT = 8;

const MS_DAY = 86_400_000;

function reasonMeta(reason: AttentionReason): { label: string; urgency: number } {
  switch (reason) {
    case "overdue_followup":
      return { label: "Overdue follow-up", urgency: 100 };
    case "due_soon":
      return { label: "Follow-up due soon", urgency: 80 };
    case "new_lead":
      return { label: "New lead", urgency: 60 };
    case "needs_action":
      return { label: "Needs review", urgency: 40 };
  }
}

export function buildAttentionLeads(leads: SalesLead[]): AttentionLead[] {
  const now = Date.now();
  const items: AttentionLead[] = [];

  for (const lead of leads) {
    if (lead.status === "disqualified" || lead.pipelineStage === "lost") continue;

    const next = lead.nextFollowupAt ? new Date(lead.nextFollowupAt).getTime() : null;
    const created = new Date(lead.createdAt).getTime();
    let reason: AttentionReason | null = null;

    if (next != null && next < now) {
      reason = "overdue_followup";
    } else if (next != null && next - now < MS_DAY) {
      reason = "due_soon";
    } else if (now - created < 2 * MS_DAY && lead.status === "new") {
      reason = "new_lead";
    } else if (
      (lead.status === "contacted" || lead.status === "qualified") &&
      (lead.pipelineStage === "contacted" || lead.pipelineStage === "qualified")
    ) {
      const updated = new Date(lead.updatedAt).getTime();
      if (now - updated > 3 * MS_DAY) reason = "needs_action";
    }

    if (!reason) continue;
    const meta = reasonMeta(reason);
    items.push({
      id: lead.id,
      company: lead.company,
      contact: lead.contact,
      email: lead.email,
      status: lead.status,
      reason,
      reasonLabel: meta.label,
      nextFollowupAt: lead.nextFollowupAt,
      urgency: meta.urgency,
      source: "live",
    });
  }

  return items.sort((a, b) => b.urgency - a.urgency).slice(0, ATTENTION_QUEUE_LIMIT);
}

export function deriveTasksFromLeads(leads: SalesLead[]): DashboardTask[] {
  const now = Date.now();
  const derived: DashboardTask[] = [];

  for (const lead of leads) {
    if (!lead.nextFollowupAt) continue;
    const due = new Date(lead.nextFollowupAt).getTime();
    if (due > now + MS_DAY) continue;
    derived.push({
      id: `followup-${lead.id}`,
      title: `Follow up with ${lead.company}`,
      dueDate: lead.nextFollowupAt,
      priority: due < now ? "high" : "medium",
      status: due < now ? "overdue" : "open",
      relatedType: "lead",
      relatedId: lead.id,
      relatedLabel: lead.company,
      source: "derived",
    });
  }

  return derived;
}

export function buildDashboardTasks(leads: SalesLead[]): DashboardTask[] {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return deriveTasksFromLeads(leads)
    .filter((t) => {
      const due = new Date(t.dueDate).getTime();
      return t.status === "overdue" || due <= endOfToday.getTime();
    })
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 8);
}

const ACTIVITY_TYPE_MAP: Record<string, DashboardActivity["type"]> = {
  lead_created: "lead",
  status_changed: "lead",
  note_updated: "lead",
  lead_converted: "lead",
  followup_sent: "workflow",
  followup_created: "workflow",
  followup_completed: "workflow",
};

export function buildDashboardActivity(
  recentActivity: LeadActivityDto[] | undefined,
  leads: SalesLead[],
  now = Date.now(),
): DashboardActivity[] {
  if (recentActivity && recentActivity.length > 0) {
    return recentActivity.slice(0, 12).map((ev) => ({
      id: ev.id,
      type: ACTIVITY_TYPE_MAP[ev.type] ?? "system",
      title: ev.title,
      subtitle: ev.detail ?? "",
      at: formatRelativeTime(ev.createdAt, now),
      atIso: ev.createdAt,
      leadId: ev.leadId,
      source: "live" as DataSource,
    }));
  }

  return leads.slice(0, 5).map((lead) => ({
    id: `act-lead-${lead.id}`,
    type: "lead" as const,
    title: `Lead updated — ${lead.company}`,
    subtitle: `${lead.contact} · ${lead.status.replace(/_/g, " ")}`,
    at: formatRelativeTime(lead.updatedAt, now),
    atIso: lead.updatedAt,
    leadId: lead.id,
    source: "live" as DataSource,
  }));
}

export function buildDashboardKpis(
  stats: {
    openLeads: number;
    activeClients: number;
    pipelineValue: number;
  } | null | undefined,
  leads: SalesLead[],
  tasks: DashboardTask[],
): DashboardKpis {
  const newLeadCount = leads.filter((l) => l.status === "new").length;
  const dueTodayCount = tasks.filter((t) => t.status === "open" || t.status === "overdue").length;

  return {
    newLeads: {
      value: newLeadCount > 0 ? newLeadCount : (stats?.openLeads ?? 0),
      source: "live",
    },
    activeClients: { value: stats?.activeClients ?? 0, source: "live" },
    tasksDueToday: { value: dueTodayCount, source: "derived" },
    pipelineValue: { value: stats?.pipelineValue ?? 0, source: "live" },
  };
}
