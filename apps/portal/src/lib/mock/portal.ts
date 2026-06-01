export type Role =
  | "owner"
  | "admin"
  | "viewer"
  | "agency_admin"
  | "agency_member";

export type StatusTone = "online" | "attention" | "issue" | "muted";

export const currentUser = {
  name: "Kira D. Morris",
  email: "kira@kdmdermatherapy.com",
  initials: "KM",
  role: "owner" as Role,
};

export type ServiceCatalogItem = {
  id: string;
  name: string;
  description: string;
  features: string[];
  status: "Active" | "Setup" | "Paused";
  lastUpdated: string;
  recentActivity: { id: string; title: string; at: string }[];
  relatedRequestIds: string[];
};

export const services: ServiceCatalogItem[] = [
  {
    id: "website-hosting",
    name: "Website Hosting",
    description: "Fast, secure hosting with daily backups and 24/7 monitoring.",
    features: ["Global CDN", "SSL certificate", "Daily backups", "Uptime monitoring"],
    status: "Active",
    lastUpdated: "Today",
    recentActivity: [
      { id: "s1", title: "Booking page refresh published", at: "2h ago" },
      { id: "s2", title: "SSL certificate renewed", at: "1 wk ago" },
    ],
    relatedRequestIds: ["R-1042", "R-1039"],
  },
  {
    id: "online-booking",
    name: "Online Booking",
    description: "Self-serve appointment booking synced to your calendar.",
    features: ["Real-time availability", "Calendar sync", "Auto-confirmations", "Reschedule links"],
    status: "Active",
    lastUpdated: "3 days ago",
    recentActivity: [
      { id: "s3", title: "17 appointments booked this week", at: "Today" },
    ],
    relatedRequestIds: ["R-1041"],
  },
  {
    id: "lead-capture",
    name: "Lead Capture",
    description: "Every form on your site routed straight to your CRM.",
    features: ["Form-to-CRM sync", "Source tracking", "Instant notifications"],
    status: "Active",
    lastUpdated: "1 wk ago",
    recentActivity: [{ id: "s4", title: "42 leads captured this month", at: "Today" }],
    relatedRequestIds: [],
  },
  {
    id: "appt-reminders",
    name: "Appointment Reminders",
    description: "SMS + email reminders that cut no-shows.",
    features: ["24h reminder", "2h reminder", "Reschedule prompt"],
    status: "Active",
    lastUpdated: "2 wk ago",
    recentActivity: [{ id: "s5", title: "318 reminders sent", at: "This month" }],
    relatedRequestIds: ["R-1040"],
  },
  {
    id: "review-campaign",
    name: "Review Request Automation",
    description: "Asks delighted clients for a Google review the day after their visit.",
    features: ["Google review link", "Throttling", "Thank-you email"],
    status: "Active",
    lastUpdated: "1 mo ago",
    recentActivity: [{ id: "s6", title: "12 new 5-star reviews", at: "This month" }],
    relatedRequestIds: [],
  },
  {
    id: "gcal-integration",
    name: "Google Calendar Integration",
    description: "Two-way sync with your business Google Calendar.",
    features: ["Two-way sync", "Conflict detection", "Buffer times"],
    status: "Active",
    lastUpdated: "1 mo ago",
    recentActivity: [{ id: "s7", title: "Synced 96 events today", at: "Today" }],
    relatedRequestIds: [],
  },
  {
    id: "sms-notifications",
    name: "SMS Notifications",
    description: "Branded SMS for confirmations, reminders, and follow-ups.",
    features: ["Branded sender", "Two-way replies", "Compliance built-in"],
    status: "Active",
    lastUpdated: "2 mo ago",
    recentActivity: [{ id: "s8", title: "412 SMS sent", at: "This month" }],
    relatedRequestIds: [],
  },
  {
    id: "monthly-report",
    name: "Monthly Analytics Report",
    description: "A business-friendly summary of leads, bookings, and impact.",
    features: ["PDF report", "Trend comparisons", "Recommendations"],
    status: "Active",
    lastUpdated: "3 days ago",
    recentActivity: [{ id: "s9", title: "May 2026 report generated", at: "3 days ago" }],
    relatedRequestIds: [],
  },
];

export const client = {
  name: "KDM Derma Therapy",
  industry: "Med Spa / Skin Care",
  plan: "Growth Automation Plan",
  monthlyPrice: 1500,
  renewalDate: "2026-06-28",
  services: services.map((s) => s.name),
};

export const kpis = {
  websiteStatus: "Online",
  automationsRunning: 6,
  leadsThisMonth: 42,
  openSupportRequests: 2,
  monthlyPlan: "$1,500/mo",
};

// ───────────────────────── Business impact ─────────────────────────

export const businessImpact = {
  leadsCaptured: 42,
  appointmentsBooked: 17,
  tasksAutomated: 412,
  hoursSaved: 18,
  reviewsGenerated: 12,
  revenueInfluenced: 6800,
  followUpsAutomated: 412,
};

export type MonthDelta = {
  label: string;
  current: number;
  previous: number;
  format?: "number" | "percent" | "hours";
};

export const monthInReview = {
  period: "May 2026",
  comparedTo: "April 2026",
  metrics: [
    { label: "Leads Captured", current: 42, previous: 30, format: "number" as const },
    { label: "Appointments Booked", current: 17, previous: 13, format: "number" as const },
    { label: "Reviews Generated", current: 12, previous: 9, format: "number" as const },
    { label: "Website Visitors", current: 4128, previous: 3380, format: "number" as const },
    { label: "Hours Saved", current: 18, previous: 15, format: "hours" as const },
  ] satisfies MonthDelta[],
};

export type ActivityItem = {
  id: string;
  kind: "website" | "automation" | "lead" | "invoice" | "integration" | "support";
  title: string;
  detail: string;
  at: string;
};

export const activity: ActivityItem[] = [
  { id: "a1", kind: "website", title: "Website update deployed", detail: "Booking page refresh published", at: "2h ago" },
  { id: "a2", kind: "automation", title: "Review Request automation completed", detail: "12 review requests sent", at: "5h ago" },
  { id: "a3", kind: "lead", title: "New lead captured", detail: "Maria S. via Booking Form", at: "6h ago" },
  { id: "a4", kind: "invoice", title: "Invoice paid", detail: "INV-2026-005 · $1,500.00", at: "Yesterday" },
  { id: "a5", kind: "integration", title: "Google Calendar reconnected", detail: "Sync restored", at: "2d ago" },
  { id: "a6", kind: "support", title: "Support request updated", detail: "Website Update · In Progress", at: "3d ago" },
];

export const website = {
  domain: "kdmdermatherapy.com",
  sslStatus: "Valid · expires Sep 2026",
  uptime: 99.98,
  lastDeployment: "Today, 9:14 AM",
  framework: "Next.js",
  cdnStatus: "Active",
  url: "https://kdmdermatherapy.com",
};

export const websiteAnalytics = {
  visitors: 4128,
  pageviews: 11942,
  bounceRate: 38.4,
  formSubmissions: 96,
  appointmentsBooked: 17,
  conversionRate: 2.3,
  topPages: [
    { path: "/", views: 3820 },
    { path: "/services", views: 2104 },
    { path: "/booking", views: 1786 },
    { path: "/about", views: 942 },
    { path: "/contact", views: 612 },
  ],
  sources: [
    { name: "Organic Search", value: 48 },
    { name: "Direct", value: 22 },
    { name: "Social", value: 18 },
    { name: "Referral", value: 12 },
  ],
  recentChanges: [
    { id: "wc1", title: "Booking page refresh", at: "Today", by: "Columbus AI" },
    { id: "wc2", title: "New 'Dermaplaning' service page", at: "1 wk ago", by: "Columbus AI" },
    { id: "wc3", title: "Updated homepage hero image", at: "2 wk ago", by: "Columbus AI" },
    { id: "wc4", title: "SEO meta improvements (site-wide)", at: "3 wk ago", by: "Columbus AI" },
  ],
};

export function trendSeries(points: number, base: number, jitter = 0.25) {
  return Array.from({ length: points }).map((_, i) => ({
    label: `D${i + 1}`,
    value: Math.round(base * (1 + Math.sin(i / 2.2) * jitter + (Math.random() - 0.5) * jitter * 0.5)),
  }));
}

export type Automation = {
  id: string;
  name: string;
  status: StatusTone;
  statusLabel: string;
  runsThisMonth: number;
  successRate: number;
  lastRun: string;
  description: string;
  outcome: string;
  outcomeCount: number;
  outcomeLabel: string;
};

export const automations: Automation[] = [
  { id: "lead-capture", name: "Lead Capture Automation", status: "online", statusLabel: "Active", runsThisMonth: 42, successRate: 100, lastRun: "12 min ago", description: "Sends every new website inquiry into your CRM with full source details.", outcome: "Zero leads lost from your booking and contact forms.", outcomeCount: 42, outcomeLabel: "Leads Captured" },
  { id: "appt-reminder", name: "Appointment Reminder", status: "online", statusLabel: "Active", runsThisMonth: 423, successRate: 99.4, lastRun: "1 hr ago", description: "SMS + email reminder 24h and 2h before each appointment.", outcome: "Fewer no-shows and rescheduling calls for your front desk.", outcomeCount: 91, outcomeLabel: "Appointments Confirmed" },
  { id: "review-req", name: "Review Request Campaign", status: "online", statusLabel: "Active", runsThisMonth: 112, successRate: 98.7, lastRun: "5 hr ago", description: "Asks happy clients for a Google review the day after their visit.", outcome: "Steady stream of 5-star reviews without staff lift.", outcomeCount: 37, outcomeLabel: "Reviews Generated" },
  { id: "crm-sync", name: "CRM Sync", status: "online", statusLabel: "Active", runsThisMonth: 1240, successRate: 99.9, lastRun: "Just now", description: "Keeps client records in sync between booking, email, and CRM.", outcome: "One reliable source of truth for every client.", outcomeCount: 1240, outcomeLabel: "Records Synced" },
  { id: "missed-call", name: "Missed Call Text Back", status: "attention", statusLabel: "Needs Attention", runsThisMonth: 28, successRate: 92.1, lastRun: "3 hr ago", description: "Texts callers automatically if a call is missed during business hours.", outcome: "Recover bookings that would otherwise be lost.", outcomeCount: 9, outcomeLabel: "Calls Recovered" },
  { id: "lead-followup", name: "Lead Follow-Up", status: "online", statusLabel: "Active", runsThisMonth: 87, successRate: 99.1, lastRun: "1 hr ago", description: "Multi-touch follow-up for leads that don't book on the first visit.", outcome: "Re-engages prospects without manual outreach.", outcomeCount: 12, outcomeLabel: "Bookings Scheduled" },
];

export type Integration = {
  id: string;
  name: string;
  status: "Connected" | "Disconnected" | "Needs Attention";
  tone: StatusTone;
  purpose: string;
  lastSync: string;
  account: string;
  businessImpact: string;
};

export const integrations: Integration[] = [
  { id: "gcal", name: "Google Calendar", status: "Connected", tone: "online", purpose: "Appointment scheduling", lastSync: "2 min ago", account: "bookings@kdmdermatherapy.com", businessImpact: "17 appointments scheduled this month" },
  { id: "gmail", name: "Gmail", status: "Connected", tone: "online", purpose: "Client email notifications", lastSync: "12 min ago", account: "kira@kdmdermatherapy.com", businessImpact: "284 confirmation emails delivered" },
  { id: "stripe", name: "Stripe", status: "Connected", tone: "online", purpose: "Payments and invoicing", lastSync: "30 min ago", account: "acct_••••8829", businessImpact: "$6,800 in revenue captured" },
  { id: "hubspot", name: "HubSpot", status: "Needs Attention", tone: "attention", purpose: "CRM and contact management", lastSync: "2 days ago", account: "KDM Workspace", businessImpact: "Pending sync — 8 contacts queued" },
  { id: "ghl", name: "GoHighLevel", status: "Connected", tone: "online", purpose: "Pipelines and outreach", lastSync: "1 hr ago", account: "KDM Sub-account", businessImpact: "42 leads routed through pipeline" },
  { id: "twilio", name: "Twilio", status: "Connected", tone: "online", purpose: "SMS notifications", lastSync: "3 min ago", account: "+1 (480) ••• 0142", businessImpact: "412 SMS sent this month" },
  { id: "sendgrid", name: "SendGrid", status: "Connected", tone: "online", purpose: "Transactional email delivery", lastSync: "20 min ago", account: "no-reply@kdmdermatherapy.com", businessImpact: "1,142 emails delivered, 0 bounces" },
  { id: "slack", name: "Slack", status: "Disconnected", tone: "muted", purpose: "Internal team notifications", lastSync: "—", account: "Not connected", businessImpact: "Not yet active" },
  { id: "openai", name: "OpenAI", status: "Connected", tone: "online", purpose: "AI chat and assistant features", lastSync: "Just now", account: "KDM Org", businessImpact: "Powers smart reply drafts" },
];

export type LeadStatus = "New" | "Contacted" | "Booked" | "Closed" | "Lost";
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  created: string;
  lastContacted: string;
};

export const leads: Lead[] = [
  { id: "L-1042", name: "Maria Santos", email: "maria.s@email.com", phone: "(602) 555-0142", source: "Booking Form", status: "New", created: "Today", lastContacted: "—" },
  { id: "L-1041", name: "Jordan Lee", email: "jordanl@email.com", phone: "(602) 555-0188", source: "Contact Form", status: "Contacted", created: "Today", lastContacted: "1h ago" },
  { id: "L-1040", name: "Priya Patel", email: "priya.p@email.com", phone: "(480) 555-0119", source: "Instagram Ad", status: "Booked", created: "Yesterday", lastContacted: "Yesterday" },
  { id: "L-1039", name: "Daniel Kim", email: "dkim@email.com", phone: "(480) 555-0177", source: "Google Search", status: "Booked", created: "Yesterday", lastContacted: "Yesterday" },
  { id: "L-1038", name: "Emily Chen", email: "emily.c@email.com", phone: "(602) 555-0102", source: "Referral", status: "Closed", created: "3 days ago", lastContacted: "2 days ago" },
  { id: "L-1037", name: "Marcus Hall", email: "marcus@email.com", phone: "(602) 555-0133", source: "Booking Form", status: "Lost", created: "4 days ago", lastContacted: "3 days ago" },
  { id: "L-1036", name: "Sofia Reyes", email: "sofia.r@email.com", phone: "(602) 555-0166", source: "Facebook Ad", status: "Contacted", created: "5 days ago", lastContacted: "4 days ago" },
  { id: "L-1035", name: "Ben Carter", email: "benc@email.com", phone: "(480) 555-0154", source: "Booking Form", status: "Booked", created: "6 days ago", lastContacted: "5 days ago" },
];

export type DocItem = {
  id: string;
  name: string;
  group: "Reports" | "Invoices" | "Contracts" | "Automation Specs" | "Website Change Requests";
  size: string;
  uploaded: string;
};

export const documents: DocItem[] = [
  { id: "d1", name: "May 2026 Performance Report.pdf", group: "Reports", size: "2.1 MB", uploaded: "3 days ago" },
  { id: "d2", name: "Apr 2026 Performance Report.pdf", group: "Reports", size: "1.9 MB", uploaded: "1 mo ago" },
  { id: "d3", name: "INV-2026-005.pdf", group: "Invoices", size: "118 KB", uploaded: "Yesterday" },
  { id: "d4", name: "INV-2026-004.pdf", group: "Invoices", size: "121 KB", uploaded: "1 mo ago" },
  { id: "d5", name: "Master Services Agreement.pdf", group: "Contracts", size: "640 KB", uploaded: "Jan 2026" },
  { id: "d6", name: "Review Request Automation Spec.pdf", group: "Automation Specs", size: "412 KB", uploaded: "2 mo ago" },
  { id: "d7", name: "Booking Page Refresh — Request.pdf", group: "Website Change Requests", size: "238 KB", uploaded: "1 wk ago" },
];

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Open" | "Overdue";
};

export const invoices: Invoice[] = [
  { id: "INV-2026-005", date: "May 28, 2026", amount: "$1,500.00", status: "Paid" },
  { id: "INV-2026-004", date: "Apr 28, 2026", amount: "$1,500.00", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 28, 2026", amount: "$1,500.00", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 28, 2026", amount: "$1,500.00", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 28, 2026", amount: "$1,500.00", status: "Paid" },
];

export type TicketStatus = "Open" | "In Progress" | "Waiting on Client" | "Resolved";
export type TicketType =
  | "Website Update"
  | "Automation Change"
  | "Integration Issue"
  | "Billing Question"
  | "New Feature Request"
  | "General Support";

export type Ticket = {
  id: string;
  request: string;
  type: TicketType;
  priority: "Low" | "Normal" | "High";
  status: TicketStatus;
  created: string;
  updated: string;
};

export const tickets: Ticket[] = [
  { id: "T-218", request: "Update homepage hero image", type: "Website Update", priority: "Normal", status: "In Progress", created: "2 days ago", updated: "5h ago" },
  { id: "T-217", request: "Add SMS reminder 1 hour before appointment", type: "Automation Change", priority: "High", status: "Open", created: "3 days ago", updated: "1 day ago" },
  { id: "T-216", request: "HubSpot contact sync delay", type: "Integration Issue", priority: "Normal", status: "Waiting on Client", created: "5 days ago", updated: "2 days ago" },
  { id: "T-215", request: "Add new staff member to booking calendar", type: "General Support", priority: "Low", status: "Resolved", created: "2 wk ago", updated: "1 wk ago" },
];

// ───────────────────────── Work Requests ─────────────────────────

export type RequestCategory = "Website" | "Automation" | "Integration" | "General";
export type RequestStatus =
  | "Requested"
  | "In Review"
  | "Planned"
  | "In Progress"
  | "Testing"
  | "Completed"
  | "Cancelled";
export type RequestPriority = "Low" | "Normal" | "High";

export type RequestComment = {
  id: string;
  author: string;
  role: "Columbus AI" | "Client";
  body: string;
  at: string;
  internal?: boolean;
};

export type RequestAttachment = { id: string; name: string; size: string };

export type RequestTimelineEvent = {
  id: string;
  step: "Requested" | "Reviewed" | "Assigned" | "In Progress" | "Completed";
  at: string;
  note?: string;
  done: boolean;
  active?: boolean;
};

export type WorkRequest = {
  id: string;
  title: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  submittedDate: string;
  assignee: string;
  lastUpdate: string;
  description: string;
  comments: RequestComment[];
  attachments: RequestAttachment[];
  timeline: RequestTimelineEvent[];
};

export const workRequests: WorkRequest[] = [
  {
    id: "R-1042",
    title: "Add a Dermaplaning service page",
    category: "Website",
    priority: "Normal",
    status: "In Progress",
    submittedDate: "May 26, 2026",
    assignee: "Devon (Columbus AI)",
    lastUpdate: "5h ago",
    description: "We'd like a dedicated page for Dermaplaning with pricing, before/after photos, and a booking CTA.",
    comments: [
      { id: "c1", author: "Kira Morris", role: "Client", body: "Photos are in the shared drive. Let me know if you need anything else.", at: "2 days ago" },
      { id: "c2", author: "Devon Park", role: "Columbus AI", body: "Got them — drafting the page now. Will share a preview tomorrow.", at: "1 day ago" },
      { id: "c3", author: "Devon Park", role: "Columbus AI", body: "Internal: SEO review pending from Maya.", at: "5h ago", internal: true },
    ],
    attachments: [{ id: "at1", name: "dermaplaning-photos.zip", size: "12.4 MB" }],
    timeline: [
      { id: "tl1", step: "Requested", at: "May 26", note: "Submitted by Kira", done: true },
      { id: "tl2", step: "Reviewed", at: "May 27", note: "Scope confirmed", done: true },
      { id: "tl3", step: "Assigned", at: "May 27", note: "Devon Park", done: true },
      { id: "tl4", step: "In Progress", at: "May 28", note: "Page draft underway", done: true, active: true },
      { id: "tl5", step: "Completed", at: "—", done: false },
    ],
  },
  {
    id: "R-1041",
    title: "New Reminder Workflow — 1h before appointment",
    category: "Automation",
    priority: "High",
    status: "Planned",
    submittedDate: "May 24, 2026",
    assignee: "Maya (Columbus AI)",
    lastUpdate: "1 day ago",
    description: "Add an SMS reminder 1 hour before each appointment in addition to the existing 24h and 2h reminders.",
    comments: [
      { id: "c4", author: "Maya Chen", role: "Columbus AI", body: "Scoped. We'll deploy this week.", at: "1 day ago" },
    ],
    attachments: [],
    timeline: [
      { id: "tl6", step: "Requested", at: "May 24", done: true },
      { id: "tl7", step: "Reviewed", at: "May 25", done: true },
      { id: "tl8", step: "Assigned", at: "May 26", note: "Maya Chen", done: true, active: true },
      { id: "tl9", step: "In Progress", at: "—", done: false },
      { id: "tl10", step: "Completed", at: "—", done: false },
    ],
  },
  {
    id: "R-1040",
    title: "Connect Mailchimp for newsletter",
    category: "Integration",
    priority: "Normal",
    status: "In Review",
    submittedDate: "May 22, 2026",
    assignee: "Unassigned",
    lastUpdate: "3 days ago",
    description: "We want our booking confirmations to also opt clients into our monthly newsletter (Mailchimp).",
    comments: [],
    attachments: [],
    timeline: [
      { id: "tl11", step: "Requested", at: "May 22", done: true },
      { id: "tl12", step: "Reviewed", at: "May 23", done: true, active: true },
      { id: "tl13", step: "Assigned", at: "—", done: false },
      { id: "tl14", step: "In Progress", at: "—", done: false },
      { id: "tl15", step: "Completed", at: "—", done: false },
    ],
  },
  {
    id: "R-1039",
    title: "Update pricing on services page",
    category: "Website",
    priority: "Low",
    status: "Completed",
    submittedDate: "May 14, 2026",
    assignee: "Devon (Columbus AI)",
    lastUpdate: "1 wk ago",
    description: "Refresh the listed prices for facials and chemical peels.",
    comments: [
      { id: "c5", author: "Devon Park", role: "Columbus AI", body: "Published. Let me know if anything else changes.", at: "1 wk ago" },
    ],
    attachments: [],
    timeline: [
      { id: "tl16", step: "Requested", at: "May 14", done: true },
      { id: "tl17", step: "Reviewed", at: "May 15", done: true },
      { id: "tl18", step: "Assigned", at: "May 15", done: true },
      { id: "tl19", step: "In Progress", at: "May 16", done: true },
      { id: "tl20", step: "Completed", at: "May 17", done: true, active: true },
    ],
  },
  {
    id: "R-1038",
    title: "Billing question — proration",
    category: "General",
    priority: "Low",
    status: "Requested",
    submittedDate: "May 30, 2026",
    assignee: "Unassigned",
    lastUpdate: "Today",
    description: "Quick question about how mid-month plan changes are billed.",
    comments: [],
    attachments: [],
    timeline: [
      { id: "tl21", step: "Requested", at: "Today", done: true, active: true },
      { id: "tl22", step: "Reviewed", at: "—", done: false },
      { id: "tl23", step: "Assigned", at: "—", done: false },
      { id: "tl24", step: "In Progress", at: "—", done: false },
      { id: "tl25", step: "Completed", at: "—", done: false },
    ],
  },
];

export const requestTemplates: Record<RequestCategory, string[]> = {
  Website: ["Add a Service Page", "Update Homepage", "Change Pricing", "Update Images", "SEO Improvements"],
  Automation: ["New Reminder Workflow", "Lead Follow-Up Automation", "Review Request Campaign", "Missed Call Text Back"],
  Integration: ["Connect Mailchimp", "Connect Stripe", "Connect HubSpot", "Connect Google Calendar"],
  General: ["Billing Question", "Technical Issue", "Consultation Request"],
};

// ───────────────────────── Reports ─────────────────────────

export type MonthlyReport = {
  id: string;
  title: string;
  type: "Monthly Performance" | "Website Performance" | "Lead Generation" | "Automation Performance" | "Quarterly Review";
  period: string;
  generatedAt: string;
  summary: string;
  fileName: string;
};

export const reports: MonthlyReport[] = [
  { id: "rp1", title: "May 2026 Performance", type: "Monthly Performance", period: "May 2026", generatedAt: "3 days ago", summary: "42 leads, 17 appointments, $6,800 revenue influenced.", fileName: "may-2026-performance.pdf" },
  { id: "rp2", title: "May 2026 Website Performance", type: "Website Performance", period: "May 2026", generatedAt: "3 days ago", summary: "4,128 visitors (+22%), 96 form submissions, 2.3% conversion.", fileName: "may-2026-website.pdf" },
  { id: "rp3", title: "May 2026 Lead Generation", type: "Lead Generation", period: "May 2026", generatedAt: "3 days ago", summary: "42 leads, 60% sourced from organic search.", fileName: "may-2026-leads.pdf" },
  { id: "rp4", title: "May 2026 Automation Performance", type: "Automation Performance", period: "May 2026", generatedAt: "3 days ago", summary: "6 automations, 1,932 runs, 99.1% average success rate.", fileName: "may-2026-automations.pdf" },
  { id: "rp5", title: "Q1 2026 Quarterly Review", type: "Quarterly Review", period: "Q1 2026", generatedAt: "1 mo ago", summary: "Quarterly business impact summary and recommendations.", fileName: "q1-2026-review.pdf" },
];

// ───────────────────────── Notifications ─────────────────────────

export type NotificationKind = "lead" | "website" | "support" | "invoice" | "automation" | "report";
export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export const notifications: Notification[] = [
  { id: "n1", kind: "lead", title: "New lead captured", body: "Maria Santos via Booking Form", at: "6h ago", read: false, href: "/leads" },
  { id: "n2", kind: "website", title: "Website update completed", body: "Booking page refresh published", at: "Today", read: false, href: "/website" },
  { id: "n3", kind: "support", title: "Request update", body: "Dermaplaning page — In Progress", at: "5h ago", read: false, href: "/requests" },
  { id: "n4", kind: "invoice", title: "Invoice paid", body: "INV-2026-005 · $1,500.00", at: "Yesterday", read: true, href: "/billing" },
  { id: "n5", kind: "automation", title: "Automation updated", body: "Review Request — runs increased 18%", at: "2d ago", read: true, href: "/automations" },
  { id: "n6", kind: "report", title: "Monthly report available", body: "May 2026 Performance Report", at: "3d ago", read: true, href: "/reports" },
];

// ───────────────────────── Team ─────────────────────────

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin: string;
  status: "Active" | "Invited" | "Suspended";
};

export const teamMembers: TeamMember[] = [
  { id: "u1", name: "Kira D. Morris", email: "kira@kdmdermatherapy.com", role: "owner", lastLogin: "Today, 9:02 AM", status: "Active" },
  { id: "u2", name: "Alex Rivera", email: "alex@kdmdermatherapy.com", role: "admin", lastLogin: "Yesterday", status: "Active" },
  { id: "u3", name: "Sam Patel", email: "sam@kdmdermatherapy.com", role: "viewer", lastLogin: "3 days ago", status: "Active" },
];
