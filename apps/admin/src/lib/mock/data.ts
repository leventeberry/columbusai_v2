// Mock data for the Columbus AI dashboard. Replace with server-backed data later.

export type LeadStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface Lead {
  id: string;
  company: string;
  contact: string;
  service: string;
  score: number;
  value: number;
  stage: LeadStage;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  status: "Onboarding" | "Active" | "At Risk" | "Paused";
  automations: number;
  lastActivity: string;
  monthlyValue: number;
  health: number;
  industry: string;
  owner: string;
}

export interface Workflow {
  id: string;
  name: string;
  runs: number;
  avgRuntime: string;
  status: "running" | "idle" | "failed" | "queued";
  lastRun: string;
  successRate: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  enabled: boolean;
  requests: number;
  avgResponseMs: number;
  costToday: number;
  successRate: number;
}

export interface Conversation {
  id: string;
  user: string;
  agent: string;
  lastMessage: string;
  sentiment: "positive" | "neutral" | "negative";
  status: "open" | "resolved" | "escalated";
  timestamp: string;
}

export interface Deployment {
  id: string;
  version: string;
  env: "production" | "staging" | "preview";
  status: "success" | "failed" | "in_progress";
  date: string;
  by: string;
}

export interface AuditEvent {
  id: string;
  type: "user" | "workflow" | "agent" | "billing" | "auth" | "system";
  actor: string;
  action: string;
  target?: string;
  at: string;
}

export interface HealthSignal {
  name: string;
  status: "healthy" | "warning" | "critical";
  latency?: string;
  detail: string;
}

export interface KpiSeries {
  label: string;
  value: string;
  delta: number;
  data: { x: number; y: number }[];
}

// ---- helpers ----
const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.round(50 + Math.sin(i / 3 + seed) * 18 + (i * (seed % 5)) / 2 + Math.cos(i + seed) * 6),
  }));

export const kpis: KpiSeries[] = [
  { label: "Monthly Revenue", value: "$482,930", delta: 12.4, data: spark(1) },
  { label: "Active Clients", value: "147", delta: 4.8, data: spark(2) },
  { label: "Open Leads", value: "63", delta: -2.1, data: spark(3) },
  { label: "Active Automations", value: "1,284", delta: 9.6, data: spark(4) },
  { label: "AI Conversations Today", value: "8,412", delta: 18.2, data: spark(5) },
  { label: "Workflow Success Rate", value: "98.7%", delta: 0.4, data: spark(6) },
];

export const leads: Lead[] = [
  { id: "l1", company: "Northwind Logistics", contact: "Avery Chen", service: "Lead Routing Agent", score: 92, value: 48000, stage: "new" },
  { id: "l2", company: "Helio Robotics", contact: "Priya Shah", service: "Support Copilot", score: 78, value: 36000, stage: "new" },
  { id: "l3", company: "Marble & Oak", contact: "Daniel Reyes", service: "Content Pipeline", score: 64, value: 18000, stage: "qualified" },
  { id: "l4", company: "Lattice Energy", contact: "Mei Tanaka", service: "Ops Automation", score: 88, value: 72000, stage: "qualified" },
  { id: "l5", company: "Pinecrest Health", contact: "Jordan Blake", service: "Intake Agent", score: 81, value: 54000, stage: "proposal" },
  { id: "l6", company: "Atlas Freight", contact: "Sam Okafor", service: "Dispatch Agent", score: 75, value: 90000, stage: "proposal" },
  { id: "l7", company: "Verge Studios", contact: "Lina Park", service: "Creative Ops", score: 69, value: 24000, stage: "negotiation" },
  { id: "l8", company: "Quanta Capital", contact: "Owen Mehta", service: "Data Analyst Agent", score: 94, value: 120000, stage: "negotiation" },
  { id: "l9", company: "Ember Apparel", contact: "Riley Stone", service: "CX Agent", score: 86, value: 42000, stage: "won" },
  { id: "l10", company: "Brightline Edu", contact: "Noor Hassan", service: "Tutor Agent", score: 71, value: 28000, stage: "won" },
  { id: "l11", company: "Crater Foods", contact: "Eli Bergman", service: "Inventory Bot", score: 52, value: 16000, stage: "lost" },
];

export const clients: Client[] = [
  { id: "c1", name: "Aperture Health", status: "Active", automations: 24, lastActivity: "2m ago", monthlyValue: 18400, health: 96, industry: "Healthcare", owner: "Maya L." },
  { id: "c2", name: "Beacon Logistics", status: "Active", automations: 41, lastActivity: "12m ago", monthlyValue: 32100, health: 88, industry: "Logistics", owner: "Theo R." },
  { id: "c3", name: "Cobalt Finance", status: "At Risk", automations: 18, lastActivity: "1h ago", monthlyValue: 27800, health: 54, industry: "Fintech", owner: "Priya S." },
  { id: "c4", name: "Drift Studios", status: "Onboarding", automations: 6, lastActivity: "4h ago", monthlyValue: 9800, health: 72, industry: "Media", owner: "Jules K." },
  { id: "c5", name: "Evergreen Retail", status: "Active", automations: 33, lastActivity: "26m ago", monthlyValue: 21500, health: 91, industry: "Retail", owner: "Maya L." },
  { id: "c6", name: "Fjord Energy", status: "Paused", automations: 9, lastActivity: "2d ago", monthlyValue: 14200, health: 60, industry: "Energy", owner: "Sam O." },
  { id: "c7", name: "Gravity Robotics", status: "Active", automations: 52, lastActivity: "5m ago", monthlyValue: 48600, health: 94, industry: "Industrial", owner: "Theo R." },
];

export const workflows: Workflow[] = [
  { id: "w1", name: "Inbound Lead Enrichment", runs: 1284, avgRuntime: "1.2s", status: "running", lastRun: "just now", successRate: 99.2 },
  { id: "w2", name: "Invoice Reconciliation", runs: 612, avgRuntime: "4.8s", status: "running", lastRun: "20s ago", successRate: 97.8 },
  { id: "w3", name: "Daily KPI Digest", runs: 30, avgRuntime: "12.4s", status: "idle", lastRun: "6h ago", successRate: 100 },
  { id: "w4", name: "Churn Risk Scorer", runs: 188, avgRuntime: "2.1s", status: "running", lastRun: "1m ago", successRate: 98.4 },
  { id: "w5", name: "Document Intake OCR", runs: 421, avgRuntime: "3.6s", status: "failed", lastRun: "8m ago", successRate: 92.1 },
  { id: "w6", name: "CRM Sync — HubSpot", runs: 902, avgRuntime: "0.9s", status: "queued", lastRun: "2m ago", successRate: 99.6 },
];

export const agents: Agent[] = [
  { id: "a1", name: "Sales Assistant", role: "Qualifies inbound leads & books meetings", enabled: true, requests: 3120, avgResponseMs: 720, costToday: 18.42, successRate: 96.4 },
  { id: "a2", name: "Customer Support Agent", role: "Tier-1 ticket resolution across channels", enabled: true, requests: 4821, avgResponseMs: 540, costToday: 24.10, successRate: 94.2 },
  { id: "a3", name: "Content Agent", role: "Drafts blog posts, emails & social copy", enabled: true, requests: 612, avgResponseMs: 1820, costToday: 9.75, successRate: 98.8 },
  { id: "a4", name: "Data Analyst", role: "Answers ad-hoc data questions over the warehouse", enabled: false, requests: 84, avgResponseMs: 2400, costToday: 2.18, successRate: 91.0 },
  { id: "a5", name: "Internal Operations Agent", role: "Automates payroll, ops & scheduling tasks", enabled: true, requests: 412, avgResponseMs: 980, costToday: 5.62, successRate: 97.1 },
];

export const conversations: Conversation[] = [
  { id: "cv1", user: "kira@aperture.health", agent: "Customer Support Agent", lastMessage: "Thanks — that worked!", sentiment: "positive", status: "resolved", timestamp: "2m ago" },
  { id: "cv2", user: "ops@beacon.co", agent: "Internal Operations Agent", lastMessage: "Can you re-run the payroll batch?", sentiment: "neutral", status: "open", timestamp: "6m ago" },
  { id: "cv3", user: "finance@cobalt.io", agent: "Data Analyst", lastMessage: "This isn't reconciling with NetSuite.", sentiment: "negative", status: "escalated", timestamp: "14m ago" },
  { id: "cv4", user: "lead@northwind.com", agent: "Sales Assistant", lastMessage: "Booked Thursday at 2pm.", sentiment: "positive", status: "resolved", timestamp: "22m ago" },
  { id: "cv5", user: "press@verge.studio", agent: "Content Agent", lastMessage: "Tighten the second paragraph.", sentiment: "neutral", status: "open", timestamp: "38m ago" },
];

export const deployments: Deployment[] = [
  { id: "d1", version: "v2024.11.04", env: "production", status: "success", date: "Today, 09:14", by: "Maya L." },
  { id: "d2", version: "v2024.11.03", env: "staging", status: "success", date: "Yesterday, 18:02", by: "Theo R." },
  { id: "d3", version: "v2024.11.02", env: "production", status: "failed", date: "Yesterday, 11:48", by: "Priya S." },
  { id: "d4", version: "v2024.11.01", env: "preview", status: "in_progress", date: "Now", by: "CI Bot" },
  { id: "d5", version: "v2024.10.29", env: "production", status: "success", date: "Oct 29, 16:20", by: "Maya L." },
];

export const audit: AuditEvent[] = [
  { id: "e1", type: "workflow", actor: "Theo R.", action: "Updated workflow", target: "Inbound Lead Enrichment", at: "2m ago" },
  { id: "e2", type: "agent", actor: "Priya S.", action: "Disabled agent", target: "Data Analyst", at: "18m ago" },
  { id: "e3", type: "billing", actor: "Stripe", action: "Invoice paid", target: "Aperture Health — $18,400", at: "1h ago" },
  { id: "e4", type: "auth", actor: "Maya L.", action: "Signed in", at: "2h ago" },
  { id: "e5", type: "system", actor: "System", action: "Auto-scaled workers", target: "+4 instances", at: "3h ago" },
  { id: "e6", type: "user", actor: "Jules K.", action: "Invited teammate", target: "noah@columbus.ai", at: "Yesterday" },
];

export const health: HealthSignal[] = [
  { name: "API", status: "healthy", latency: "84ms", detail: "All regions green" },
  { name: "Database", status: "healthy", latency: "12ms", detail: "Primary + 2 replicas" },
  { name: "Redis", status: "warning", latency: "38ms", detail: "Memory at 78%" },
  { name: "Job Queue", status: "healthy", detail: "412 jobs in flight" },
  { name: "Workflow Queue", status: "healthy", detail: "Drained in 6s" },
  { name: "AI Providers", status: "warning", detail: "Anthropic elevated latency" },
];

export const revenueSeries = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  revenue: 12000 + Math.round(Math.sin(i / 3) * 2400 + i * 380 + Math.random() * 800),
  newRevenue: 2000 + Math.round(Math.cos(i / 4) * 600 + i * 60),
}));

export const usageSeries = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  tokens: 240000 + Math.round(Math.sin(i / 2) * 40000 + i * 6000),
  conversations: 1800 + Math.round(Math.cos(i / 3) * 220 + i * 40),
}));
