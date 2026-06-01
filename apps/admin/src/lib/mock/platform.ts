// Multi-tenant platform mock layer. Wraps the existing `clients` list with
// workspaces, environments, services, deployments, domains, secrets,
// environment variables, provisioning jobs, usage events and timeline events.

import { clients } from "./data";

export type EnvKind = "production" | "staging" | "development";
export type ServiceKind =
  | "website"
  | "postgres"
  | "redis"
  | "n8n"
  | "vector"
  | "ai-agent"
  | "analytics";
export type RunStatus = "pending" | "running" | "success" | "failed";

export interface Workspace {
  id: string;
  clientId: string;
  name: string;
  region: string;
}

export interface Environment {
  id: string;
  workspaceId: string;
  clientId: string;
  kind: EnvKind;
  domain: string;
  region: string;
  stackTemplateId: string;
  status: "healthy" | "degraded" | "down";
}

export interface StackTemplate {
  id: string;
  name: string;
  description: string;
  services: ServiceKind[];
  enabled: boolean;
}

export interface Service {
  id: string;
  environmentId: string;
  kind: ServiceKind;
  status: "running" | "degraded" | "stopped";
  cpu: number;
  memory: number;
}

export interface Domain {
  id: string;
  environmentId: string;
  host: string;
  ssl: "valid" | "expiring" | "invalid";
  dns: "ok" | "pending" | "error";
  cdn: "active" | "off";
}

export interface EnvVar {
  id: string;
  environmentId: string;
  key: string;
  value: string;
  scope: "runtime" | "build";
  updatedAt: string;
}

export interface Secret {
  id: string;
  environmentId: string;
  key: string;
  masked: string;
  rotatedAt: string;
}

export interface ProvisioningStep {
  label: string;
  status: RunStatus;
}

export interface ProvisioningJob {
  id: string;
  clientId: string;
  workspaceId: string;
  templateId: string;
  status: RunStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  steps: ProvisioningStep[];
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  kind: "deployment" | "workflow" | "alert" | "ssl" | "dns" | "integration";
  message: string;
  severity: "info" | "warn" | "error" | "success";
  ts: string;
}

// ---- Stack templates ----
export const stackTemplates: StackTemplate[] = [
  {
    id: "tpl-basic",
    name: "Basic Website",
    description: "Static-friendly site with analytics. Ideal for marketing pages.",
    services: ["website", "analytics"],
    enabled: true,
  },
  {
    id: "tpl-automation",
    name: "Automation Stack",
    description: "Website plus database, cache, and n8n for back-office automation.",
    services: ["website", "postgres", "redis", "n8n", "analytics"],
    enabled: true,
  },
  {
    id: "tpl-ai",
    name: "AI Business Stack",
    description: "Full AI-native stack with vector DB and a managed AI agent.",
    services: ["website", "postgres", "redis", "n8n", "vector", "ai-agent", "analytics"],
    enabled: true,
  },
];

const REGIONS = ["iad1 · US East", "fra1 · EU Central", "syd1 · APAC"];

function pickTemplate(automations: number): StackTemplate {
  if (automations > 30) return stackTemplates[2];
  if (automations > 10) return stackTemplates[1];
  return stackTemplates[0];
}

// ---- Derive workspaces / environments per client ----
export const workspaces: Workspace[] = clients.map((c, i) => ({
  id: `ws-${c.id}`,
  clientId: c.id,
  name: `${c.name} Workspace`,
  region: REGIONS[i % REGIONS.length],
}));

export const environments: Environment[] = workspaces.flatMap((w) => {
  const c = clients.find((x) => x.id === w.clientId)!;
  const tpl = pickTemplate(c.automations);
  const slug = c.name.toLowerCase().replace(/[^a-z]+/g, "-");
  const mk = (kind: EnvKind, host: string): Environment => ({
    id: `env-${w.clientId}-${kind}`,
    workspaceId: w.id,
    clientId: w.clientId,
    kind,
    domain: host,
    region: w.region,
    stackTemplateId: tpl.id,
    status: kind === "production" && c.health < 70 ? "degraded" : "healthy",
  });
  return [
    mk("production", `${slug}.io`),
    mk("staging", `staging.${slug}.io`),
    mk("development", `dev.${slug}.io`),
  ];
});

// ---- Services per environment ----
export const services: Service[] = environments.flatMap((e) => {
  const tpl = stackTemplates.find((t) => t.id === e.stackTemplateId)!;
  return tpl.services.map<Service>((kind, i) => ({
    id: `svc-${e.id}-${kind}`,
    environmentId: e.id,
    kind,
    status: e.status === "degraded" && kind === "redis" ? "degraded" : "running",
    cpu: 10 + ((i * 13) % 70),
    memory: 20 + ((i * 17) % 60),
  }));
});

// ---- Domains ----
export const domains: Domain[] = environments.map((e, i) => ({
  id: `dom-${e.id}`,
  environmentId: e.id,
  host: e.domain,
  ssl: i % 11 === 0 ? "expiring" : "valid",
  dns: i % 9 === 0 ? "pending" : "ok",
  cdn: e.kind === "development" ? "off" : "active",
}));

// ---- Env vars ----
const COMMON_VARS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SITE_URL",
  "DATABASE_URL",
  "REDIS_URL",
];
export const envVars: EnvVar[] = environments.flatMap((e) =>
  COMMON_VARS.map<EnvVar>((key, i) => ({
    id: `ev-${e.id}-${key}`,
    environmentId: e.id,
    key,
    value:
      key === "NEXT_PUBLIC_SITE_URL"
        ? `https://${e.domain}`
        : key === "NEXT_PUBLIC_API_URL"
        ? `https://api.${e.domain}`
        : key === "DATABASE_URL"
        ? `postgres://app:****@db.${e.domain}:5432/app`
        : `redis://default:****@cache.${e.domain}:6379`,
    scope: i < 2 ? "build" : "runtime",
    updatedAt: `${i + 2}d ago`,
  }))
);

// ---- Secrets ----
const SECRET_KEYS = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "TWILIO_AUTH_TOKEN",
  "SMTP_PASSWORD",
  "SENDGRID_API_KEY",
];
export const secrets: Secret[] = environments.flatMap((e) =>
  SECRET_KEYS.map<Secret>((key, i) => ({
    id: `sec-${e.id}-${key}`,
    environmentId: e.id,
    key,
    masked: "•••• •••• •••• " + (1000 + i).toString().slice(-4),
    rotatedAt: `${(i + 1) * 7}d ago`,
  }))
);

// ---- Provisioning jobs ----
const STEP_LABELS = [
  "Create Database",
  "Create Redis",
  "Create Website",
  "Configure DNS",
  "Configure SSL",
  "Create n8n",
  "Configure Monitoring",
  "Create Analytics",
];

function mkSteps(completed: number, failedAt?: number): ProvisioningStep[] {
  return STEP_LABELS.map<ProvisioningStep>((label, i) => {
    if (failedAt !== undefined && i === failedAt) return { label, status: "failed" };
    if (failedAt !== undefined && i > failedAt) return { label, status: "pending" };
    if (i < completed) return { label, status: "success" };
    if (i === completed) return { label, status: "running" };
    return { label, status: "pending" };
  });
}

export const provisioningJobs: ProvisioningJob[] = [
  {
    id: "job-1",
    clientId: clients[0].id,
    workspaceId: `ws-${clients[0].id}`,
    templateId: "tpl-ai",
    status: "running",
    progress: 50,
    startedAt: "2m ago",
    steps: mkSteps(4),
  },
  {
    id: "job-2",
    clientId: clients[3].id,
    workspaceId: `ws-${clients[3].id}`,
    templateId: "tpl-automation",
    status: "running",
    progress: 25,
    startedAt: "6m ago",
    steps: mkSteps(2),
  },
  {
    id: "job-3",
    clientId: clients[1].id,
    workspaceId: `ws-${clients[1].id}`,
    templateId: "tpl-automation",
    status: "success",
    progress: 100,
    startedAt: "1h ago",
    completedAt: "52m ago",
    steps: mkSteps(STEP_LABELS.length),
  },
  {
    id: "job-4",
    clientId: clients[2].id,
    workspaceId: `ws-${clients[2].id}`,
    templateId: "tpl-ai",
    status: "failed",
    progress: 38,
    startedAt: "3h ago",
    completedAt: "2h ago",
    steps: mkSteps(3, 3),
  },
  {
    id: "job-5",
    clientId: clients[4].id,
    workspaceId: `ws-${clients[4].id}`,
    templateId: "tpl-basic",
    status: "pending",
    progress: 0,
    startedAt: "just now",
    steps: mkSteps(0).map((s, i) => (i === 0 ? { ...s, status: "pending" } : s)),
  },
];

// ---- Timeline events per client ----
export const timeline: TimelineEvent[] = clients.flatMap((c) => [
  { id: `tl-${c.id}-1`, clientId: c.id, kind: "deployment", severity: "success", message: "Deployment v2024.11.04 succeeded", ts: "Today · 09:14" },
  { id: `tl-${c.id}-2`, clientId: c.id, kind: "workflow", severity: "info", message: "Workflow CRM Sync completed in 1.2s", ts: "2h ago" },
  { id: `tl-${c.id}-3`, clientId: c.id, kind: "alert", severity: "warn", message: "Redis memory crossed 75% threshold", ts: "Yesterday · 14:02" },
  { id: `tl-${c.id}-4`, clientId: c.id, kind: "ssl", severity: "success", message: "SSL certificate renewed", ts: "3 days ago" },
  { id: `tl-${c.id}-5`, clientId: c.id, kind: "dns", severity: "success", message: "DNS configuration updated", ts: "5 days ago" },
]);

// ---- Usage events ----
export interface UsagePoint {
  ts: string;
  compute: number;
  workflows: number;
  aiTokens: number;
  traffic: number;
  apiRequests: number;
  storage: number;
  dbSize: number;
}

export function usageFor(range: "24h" | "7d" | "30d" | "90d"): UsagePoint[] {
  const n = range === "24h" ? 24 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const unit = range === "24h" ? "h" : "d";
  return Array.from({ length: n }, (_, i) => ({
    ts: `${i + 1}${unit}`,
    compute: 40 + Math.round(Math.sin(i / 3) * 14 + i * 0.6),
    workflows: 800 + Math.round(Math.cos(i / 4) * 220 + i * 12),
    aiTokens: 220000 + Math.round(Math.sin(i / 2) * 60000 + i * 4500),
    traffic: 12000 + Math.round(Math.cos(i / 5) * 3200 + i * 180),
    apiRequests: 8400 + Math.round(Math.sin(i / 2.5) * 2200 + i * 140),
    storage: 18 + Math.round(i * 0.12),
    dbSize: 4 + Math.round(i * 0.04 * 10) / 10,
  }));
}

// ---- Convenience lookups ----
export function workspacesFor(clientId: string) {
  return workspaces.filter((w) => w.clientId === clientId);
}
export function environmentsFor(workspaceId: string) {
  return environments.filter((e) => e.workspaceId === workspaceId);
}
export function servicesFor(environmentId: string) {
  return services.filter((s) => s.environmentId === environmentId);
}
export function domainsFor(environmentId: string) {
  return domains.filter((d) => d.environmentId === environmentId);
}
export function envVarsFor(environmentId: string) {
  return envVars.filter((v) => v.environmentId === environmentId);
}
export function secretsFor(environmentId: string) {
  return secrets.filter((s) => s.environmentId === environmentId);
}
export function timelineFor(clientId: string) {
  return timeline.filter((t) => t.clientId === clientId);
}
