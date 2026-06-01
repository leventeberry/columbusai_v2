// ─────────────────────────── In-memory mock "database" ───────────────────────────
// The ONLY module that owns mutable state for the work-center domain.
// Repositories are the only consumers; components must not import this file.
//
// Structured to mirror a future Supabase schema (`work_items`, `work_comments`,
// `work_attachments`, `work_activity`, `notifications`, `users`, `clients`).

import type {
  Client,
  Notification,
  User,
  WorkActivity,
  WorkAttachment,
  WorkComment,
  WorkItem,
} from "@/data/entities";

// ────────── Seed: users + clients ──────────

export const CURRENT_CLIENT_ID = "c-kdm";
export const CURRENT_CLIENT_USER_ID = "u-kira";
export const CURRENT_AGENCY_USER_ID = "u-levente";

const seedClients: Client[] = [
  { id: "c-kdm", name: "KDM Derma Therapy", industry: "Med Spa / Skin Care" },
  { id: "c-arroyo", name: "Arroyo Dental Studio", industry: "Dentistry" },
  { id: "c-blueline", name: "Blueline Fitness", industry: "Fitness / Wellness" },
];

const seedUsers: User[] = [
  // Agency
  { id: "u-devon", name: "Devon Park", email: "devon@columbusai.com", initials: "DP", kind: "agency" },
  { id: "u-maya", name: "Maya Chen", email: "maya@columbusai.com", initials: "MC", kind: "agency" },
  { id: "u-levente", name: "LeVente Ortiz", email: "levente@columbusai.com", initials: "LO", kind: "agency" },
  { id: "u-sasha", name: "Sasha Reilly", email: "sasha@columbusai.com", initials: "SR", kind: "agency" },
  // KDM (current client)
  { id: "u-kira", name: "Kira D. Morris", email: "kira@kdmdermatherapy.com", initials: "KM", kind: "client", clientId: "c-kdm" },
  { id: "u-alex", name: "Alex Rivera", email: "alex@kdmdermatherapy.com", initials: "AR", kind: "client", clientId: "c-kdm" },
  // Other client users
  { id: "u-juno", name: "Juno Park", email: "juno@arroyodental.com", initials: "JP", kind: "client", clientId: "c-arroyo" },
  { id: "u-riley", name: "Riley Banks", email: "riley@bluelinefitness.com", initials: "RB", kind: "client", clientId: "c-blueline" },
];

// ────────── Seed: work items, comments, attachments, activity ──────────

function iso(daysAgo: number, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

let _seedSeq = 1000;
const sid = (prefix: string) => `${prefix}-${++_seedSeq}`;

function seedItems(): WorkItem[] {
  return [
    { id: "WI-1042", title: "Add a Dermaplaning service page", description: "Dedicated page for Dermaplaning with pricing, before/after photos, and a booking CTA.", type: "website", status: "in_progress", priority: "medium", clientId: "c-kdm", createdBy: "u-kira", primaryAssigneeId: "u-devon", assigneeIds: ["u-devon"], watcherIds: ["u-maya", "u-alex"], tags: ["service-page"], createdAt: iso(6), updatedAt: iso(0, 5) },
    { id: "WI-1041", title: "New Reminder Workflow — 1h before appointment", description: "Add an SMS reminder 1 hour before each appointment in addition to the existing 24h and 2h reminders.", type: "automation", status: "planned", priority: "high", clientId: "c-kdm", createdBy: "u-kira", primaryAssigneeId: "u-maya", assigneeIds: ["u-maya"], watcherIds: ["u-levente"], tags: ["reminders"], createdAt: iso(8), updatedAt: iso(1) },
    { id: "WI-1040", title: "Connect Mailchimp for newsletter", description: "Booking confirmations should opt clients into our monthly newsletter (Mailchimp).", type: "integration", status: "in_review", priority: "medium", clientId: "c-kdm", createdBy: "u-alex", primaryAssigneeId: null, assigneeIds: [], watcherIds: [], tags: [], createdAt: iso(10), updatedAt: iso(3) },
    { id: "WI-1039", title: "Update pricing on services page", description: "Refresh listed prices for facials and chemical peels.", type: "website", status: "completed", priority: "low", clientId: "c-kdm", createdBy: "u-kira", primaryAssigneeId: "u-devon", assigneeIds: ["u-devon"], watcherIds: [], tags: [], createdAt: iso(18), updatedAt: iso(11) },
    { id: "WI-1038", title: "Billing question — proration", description: "Quick question about how mid-month plan changes are billed.", type: "billing", status: "requested", priority: "low", clientId: "c-kdm", createdBy: "u-kira", primaryAssigneeId: null, assigneeIds: [], watcherIds: [], tags: [], createdAt: iso(0, 6), updatedAt: iso(0, 6) },
    { id: "WI-1037", title: "Booking form not submitting on Safari", description: "Reported by a client — the booking form's submit button does nothing on Safari iOS 17.", type: "bug", status: "in_progress", priority: "critical", clientId: "c-kdm", createdBy: "u-kira", primaryAssigneeId: "u-levente", assigneeIds: ["u-levente", "u-devon"], watcherIds: ["u-maya"], tags: ["safari", "booking"], createdAt: iso(1), updatedAt: iso(0, 2) },
    { id: "WI-1036", title: "Quarterly review prep", description: "Pull Q1 numbers, draft recommendations, schedule call.", type: "internal", status: "in_progress", priority: "medium", clientId: "c-kdm", createdBy: "u-levente", primaryAssigneeId: "u-sasha", assigneeIds: ["u-sasha"], watcherIds: ["u-levente"], tags: ["qbr"], createdAt: iso(4), updatedAt: iso(0, 8) },
    { id: "WI-1035", title: "Onboarding — Arroyo Dental Studio", description: "Kickoff, brand assets, hosting transfer, automation discovery.", type: "onboarding", status: "in_progress", priority: "high", clientId: "c-arroyo", createdBy: "u-levente", primaryAssigneeId: "u-devon", assigneeIds: ["u-devon", "u-maya"], watcherIds: ["u-levente"], tags: [], createdAt: iso(5), updatedAt: iso(0, 3) },
    { id: "WI-1034", title: "Deploy new homepage hero", description: "Push approved hero design to production after QA.", type: "deployment", status: "testing", priority: "medium", clientId: "c-blueline", createdBy: "u-riley", primaryAssigneeId: "u-devon", assigneeIds: ["u-devon"], watcherIds: [], tags: [], createdAt: iso(2), updatedAt: iso(0, 1) },
    { id: "WI-1033", title: "Stripe webhook returning 401 intermittently", description: "We're seeing periodic 401s from the Stripe webhook endpoint. Investigate retries.", type: "support", status: "waiting_on_client", priority: "high", clientId: "c-blueline", createdBy: "u-levente", primaryAssigneeId: "u-maya", assigneeIds: ["u-maya"], watcherIds: ["u-levente"], tags: ["stripe"], createdAt: iso(3), updatedAt: iso(1) },
  ];
}

function seedComments(): WorkComment[] {
  return [
    { id: sid("cm"), workItemId: "WI-1042", authorId: "u-kira", body: "Photos are in the shared drive. Let me know if you need anything else.", visibility: "public", mentions: [], createdAt: iso(2) },
    { id: sid("cm"), workItemId: "WI-1042", authorId: "u-devon", body: "Got them — drafting the page now. Will share a preview tomorrow.", visibility: "public", mentions: ["u-kira"], createdAt: iso(1) },
    { id: sid("cm"), workItemId: "WI-1042", authorId: "u-devon", body: "SEO review pending from @Maya before we publish.", visibility: "internal", mentions: ["u-maya"], createdAt: iso(0, 5) },
    { id: sid("cm"), workItemId: "WI-1041", authorId: "u-maya", body: "Scoped. We'll deploy this week.", visibility: "public", mentions: [], createdAt: iso(1) },
    { id: sid("cm"), workItemId: "WI-1037", authorId: "u-levente", body: "Reproduced on Safari 17.4. Looks like a missing event preventDefault on submit.", visibility: "internal", mentions: [], createdAt: iso(0, 4) },
    { id: sid("cm"), workItemId: "WI-1037", authorId: "u-devon", body: "Patch deployed to staging — please retest @Kira.", visibility: "public", mentions: ["u-kira"], createdAt: iso(0, 2) },
  ];
}

function seedAttachments(): WorkAttachment[] {
  return [
    { id: sid("att"), workItemId: "WI-1042", uploaderId: "u-kira", name: "dermaplaning-photos.zip", size: 12_400_000, mime: "application/zip", url: "#", createdAt: iso(2) },
    { id: sid("att"), workItemId: "WI-1037", uploaderId: "u-kira", name: "safari-screenshot.png", size: 240_000, mime: "image/png", url: "#", createdAt: iso(1) },
  ];
}

function seedActivity(items: WorkItem[], comments: WorkComment[], attachments: WorkAttachment[]): WorkActivity[] {
  const activity: WorkActivity[] = [];
  for (const w of items) {
    activity.push({ id: sid("ac"), workItemId: w.id, actorId: w.createdBy, kind: "created", createdAt: w.createdAt });
    if (w.primaryAssigneeId) {
      activity.push({ id: sid("ac"), workItemId: w.id, actorId: "u-levente", kind: "assignee_changed", to: w.primaryAssigneeId, createdAt: w.createdAt });
    }
    if (w.status !== "requested") {
      activity.push({ id: sid("ac"), workItemId: w.id, actorId: w.primaryAssigneeId ?? "u-levente", kind: "status_changed", from: "requested", to: w.status, createdAt: w.updatedAt });
    }
    if (w.status === "completed") {
      activity.push({ id: sid("ac"), workItemId: w.id, actorId: w.primaryAssigneeId ?? "u-levente", kind: "completed", createdAt: w.updatedAt });
    }
  }
  for (const c of comments) {
    activity.push({ id: sid("ac"), workItemId: c.workItemId, actorId: c.authorId, kind: "comment_added", createdAt: c.createdAt });
  }
  for (const a of attachments) {
    activity.push({ id: sid("ac"), workItemId: a.workItemId, actorId: a.uploaderId, kind: "attachment_added", to: a.name, createdAt: a.createdAt });
  }
  return activity;
}

// ────────── Store (pub/sub) ──────────

type Db = {
  clients: Client[];
  users: User[];
  workItems: WorkItem[];
  comments: WorkComment[];
  attachments: WorkAttachment[];
  activity: WorkActivity[];
  notifications: Notification[];
};

function initial(): Db {
  const workItems = seedItems();
  const comments = seedComments();
  const attachments = seedAttachments();
  const activity = seedActivity(workItems, comments, attachments);
  return {
    clients: seedClients,
    users: seedUsers,
    workItems,
    comments,
    attachments,
    activity,
    notifications: [],
  };
}

let db: Db = initial();
const listeners = new Set<() => void>();

export function dbSnapshot(): Db {
  return db;
}

export function dbSubscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function dbMutate(fn: (current: Db) => Db): void {
  db = fn(db);
  for (const l of listeners) l();
}

// Monotonic id generator shared across repositories
let _seq = 5000;
export function nextId(prefix: string): string {
  return `${prefix}-${++_seq}`;
}
export function nextWorkItemId(): string {
  return `WI-${++_seq}`;
}
