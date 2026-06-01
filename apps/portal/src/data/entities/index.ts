// Pure entity types + enums. No logic, no React. Mirrors the future
// Supabase schema so the swap is mechanical.

export type WorkType =
  | "website"
  | "automation"
  | "integration"
  | "support"
  | "deployment"
  | "bug"
  | "internal"
  | "billing"
  | "onboarding";

export type WorkStatus =
  | "requested"
  | "in_review"
  | "planned"
  | "in_progress"
  | "waiting_on_client"
  | "testing"
  | "completed"
  | "cancelled";

export type WorkPriority = "low" | "medium" | "high" | "critical";

export type WorkCommentVisibility = "public" | "internal";

export type WorkActivityKind =
  | "created"
  | "status_changed"
  | "assignee_changed"
  | "priority_changed"
  | "watcher_added"
  | "watcher_removed"
  | "comment_added"
  | "attachment_added"
  | "attachment_removed"
  | "archived"
  | "completed";

export type NotificationKind = WorkActivityKind;

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  kind: "client" | "agency";
  clientId?: string;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
};

export type WorkItem = {
  id: string;
  title: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  priority: WorkPriority;
  clientId: string;
  createdBy: string;
  primaryAssigneeId: string | null;
  assigneeIds: string[];
  watcherIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  archivedAt?: string;
};

export type WorkComment = {
  id: string;
  workItemId: string;
  authorId: string;
  body: string;
  visibility: WorkCommentVisibility;
  mentions: string[];
  parentId?: string;
  createdAt: string;
  editedAt?: string;
};

export type WorkAttachment = {
  id: string;
  workItemId: string;
  uploaderId: string;
  name: string;
  size: number;
  mime: string;
  url: string;
  createdAt: string;
};

export type WorkActivity = {
  id: string;
  workItemId: string;
  actorId: string;
  kind: WorkActivityKind;
  from?: string;
  to?: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  recipientId: string;
  workItemId: string;
  activityId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

// ──────────────────────── Reference data (display) ────────────────────────

export const WORK_STATUSES: WorkStatus[] = [
  "requested",
  "in_review",
  "planned",
  "in_progress",
  "waiting_on_client",
  "testing",
  "completed",
  "cancelled",
];

export const WORK_KANBAN_STATUSES: WorkStatus[] = [
  "requested",
  "in_review",
  "planned",
  "in_progress",
  "waiting_on_client",
  "testing",
  "completed",
];

export const WORK_TYPES: WorkType[] = [
  "website",
  "automation",
  "integration",
  "support",
  "deployment",
  "bug",
  "internal",
  "billing",
  "onboarding",
];

export const WORK_PRIORITIES: WorkPriority[] = ["low", "medium", "high", "critical"];

export const workStatusLabel: Record<WorkStatus, string> = {
  requested: "Requested",
  in_review: "In Review",
  planned: "Planned",
  in_progress: "In Progress",
  waiting_on_client: "Waiting on Client",
  testing: "Testing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const workTypeLabel: Record<WorkType, string> = {
  website: "Website",
  automation: "Automation",
  integration: "Integration",
  support: "Support",
  deployment: "Deployment",
  bug: "Bug",
  internal: "Internal",
  billing: "Billing",
  onboarding: "Onboarding",
};

export const workPriorityLabel: Record<WorkPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const workActivityLabel: Record<WorkActivityKind, string> = {
  created: "created this work item",
  status_changed: "changed status",
  assignee_changed: "changed assignee",
  priority_changed: "changed priority",
  watcher_added: "added a watcher",
  watcher_removed: "removed a watcher",
  comment_added: "commented",
  attachment_added: "added an attachment",
  attachment_removed: "removed an attachment",
  archived: "archived this work item",
  completed: "completed this work item",
};
