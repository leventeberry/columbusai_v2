import { audit as mockAudit } from "@/lib/mock/data";
import type { SalesLead } from "@/lib/sales-types";
import type {
  AttentionLead,
  AttentionReason,
  DashboardActivity,
  DashboardKpis,
  DashboardTask,
  DataSource,
} from "./types";

const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

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
    } else if (lead.status === "qualified" && lead.pipelineStage === "qualified") {
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

  return items.sort((a, b) => b.urgency - a.urgency).slice(0, 12);
}

const SEED_TASKS: DashboardTask[] = [
  {
    id: "task-1",
    title: "Review onboarding checklist for Aperture Health",
    dueDate: new Date().toISOString(),
    priority: "high",
    status: "open",
    relatedType: "client",
    relatedLabel: "Aperture Health",
    source: "mock",
  },
  {
    id: "task-2",
    title: "Send proposal follow-up to Helio Robotics",
    dueDate: new Date(Date.now() - MS_DAY).toISOString(),
    priority: "critical",
    status: "overdue",
    relatedType: "lead",
    relatedLabel: "Helio Robotics",
    source: "mock",
  },
  {
    id: "task-3",
    title: "Confirm portal access for new client",
    dueDate: new Date(Date.now() + MS_HOUR * 4).toISOString(),
    priority: "medium",
    status: "open",
    relatedType: "client",
    relatedLabel: "Northwind Logistics",
    source: "mock",
  },
];

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
  const combined = [...deriveTasksFromLeads(leads), ...SEED_TASKS];
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return combined
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

export function buildDashboardActivity(leads: SalesLead[]): DashboardActivity[] {
  const fromLeads: DashboardActivity[] = leads.slice(0, 5).map((lead) => ({
    id: `act-lead-${lead.id}`,
    type: "lead" as const,
    title: `Lead updated — ${lead.company}`,
    subtitle: `${lead.contact} · ${lead.status.replace(/_/g, " ")}`,
    at: new Date(lead.updatedAt).toLocaleString(),
    atIso: lead.updatedAt,
    leadId: lead.id,
    source: "live" as DataSource,
  }));

  const fromMock: DashboardActivity[] = mockAudit.slice(0, 6).map((e) => ({
    id: `act-mock-${e.id}`,
    type:
      e.type === "workflow"
        ? ("workflow" as const)
        : e.type === "user"
          ? ("system" as const)
          : ("message" as const),
    title: e.action,
    subtitle: e.target ? `${e.target} · ${e.actor}` : e.actor,
    at: e.at,
    source: "mock" as DataSource,
  }));

  return [...fromLeads, ...fromMock].slice(0, 10);
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
    tasksDueToday: { value: dueTodayCount, source: tasks.some((t) => t.source === "live") ? "live" : "derived" },
    unreadMessages: { value: 3, source: "mock" },
    pipelineValue: { value: stats?.pipelineValue ?? 0, source: "live" },
  };
}
