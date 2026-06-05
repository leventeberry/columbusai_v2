/** Dashboard adapter types — swap mock sources for live APIs without changing UI components. */

export type DataSource = "live" | "mock" | "derived";

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "open" | "overdue" | "completed";

export type DashboardTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedType?: "lead" | "client";
  relatedId?: string;
  relatedLabel?: string;
  source: DataSource;
};

export type DashboardActivity = {
  id: string;
  type: "lead" | "followup" | "client" | "onboarding" | "workflow" | "message" | "system";
  title: string;
  subtitle?: string;
  at: string;
  atIso?: string;
  leadId?: string;
  source: DataSource;
};

export type AttentionReason = "overdue_followup" | "due_soon" | "new_lead" | "needs_action";

export type AttentionLead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  status: string;
  reason: AttentionReason;
  reasonLabel: string;
  nextFollowupAt: string | null;
  urgency: number;
  source: DataSource;
};

export type DashboardKpis = {
  newLeads: { value: number; source: DataSource };
  activeClients: { value: number; source: DataSource };
  tasksDueToday: { value: number; source: DataSource };
  unreadMessages: { value: number; source: DataSource };
  pipelineValue: { value: number; source: DataSource };
};
