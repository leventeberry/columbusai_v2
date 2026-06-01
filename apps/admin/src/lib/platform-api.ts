// Backend-ready action layer for Columbus AI.
// Every operational button in the app calls one of these functions.
// All functions are typed and currently return mocked responses, but the
// shape is designed so each body can later be replaced with a real
// `fetch('/api/...')` call without changing the UI.

import { useSyncExternalStore } from "react";
import {
  provisioningJobs as seedJobs,
  timeline as seedTimeline,
  stackTemplates as seedTemplates,
  type ProvisioningJob,
  type ProvisioningStep,
  type TimelineEvent,
  type StackTemplate,
  type EnvKind,
} from "./mock/platform";

// ---------------- Result + helpers ----------------

export type PlatformActionResult = {
  success: boolean;
  message: string;
  jobId?: string;
  deploymentId?: string;
  serviceId?: string;
  secretId?: string;
  domainId?: string;
  templateId?: string;
  workspaceId?: string;
  environmentId?: string;
  logsUrl?: string;
  externalUrl?: string;
  error?: string;
};

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

export function mockDelay(min = 350, max = 900) {
  return new Promise<void>((r) => setTimeout(r, rand(min, max)));
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function maybeFail(rate = 0) {
  return Math.random() < rate;
}

// ---------------- Reactive store ----------------

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;
function emit() {
  version++;
  listeners.forEach((l) => l());
}
function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const store = {
  jobs: [...seedJobs] as ProvisioningJob[],
  timeline: [...seedTimeline] as TimelineEvent[],
  templates: [...seedTemplates] as StackTemplate[],
  pausedEnvs: new Set<string>(),
};

export function usePlatformVersion() {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}

export function getJobs() {
  return store.jobs;
}
export function getTimeline(clientId: string) {
  return store.timeline.filter((t) => t.clientId === clientId);
}
export function getTemplates() {
  return store.templates;
}
export function isEnvPaused(envId: string) {
  return store.pausedEnvs.has(envId);
}

function appendTimeline(evt: Omit<TimelineEvent, "id" | "ts"> & { ts?: string }) {
  store.timeline = [
    { id: newId("tl"), ts: "just now", ...evt },
    ...store.timeline,
  ];
}

// ---------------- Provisioning ----------------

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

function freshSteps(): ProvisioningStep[] {
  return STEP_LABELS.map((label, i) => ({
    label,
    status: i === 0 ? "running" : "pending",
  }));
}

export type ProvisionStackInput = {
  clientId: string;
  templateId: string;
  workspaceId: string;
  environmentId?: string;
};

export async function provisionClientStack(
  input: ProvisionStackInput,
): Promise<PlatformActionResult> {
  await mockDelay();
  const job: ProvisioningJob = {
    id: newId("job"),
    clientId: input.clientId,
    workspaceId: input.workspaceId,
    templateId: input.templateId,
    status: "running",
    progress: 0,
    startedAt: "just now",
    steps: freshSteps(),
  };
  store.jobs = [job, ...store.jobs];
  appendTimeline({
    clientId: input.clientId,
    kind: "deployment",
    severity: "info",
    message: `Provisioning job started (${input.templateId})`,
  });
  emit();
  return { success: true, message: "Provisioning job started", jobId: job.id };
}

export async function cancelProvisioningJob({
  jobId,
}: {
  jobId: string;
}): Promise<PlatformActionResult> {
  await mockDelay(200, 500);
  store.jobs = store.jobs.map((j) =>
    j.id === jobId
      ? {
          ...j,
          status: "failed",
          completedAt: "just now",
          steps: j.steps.map((s) =>
            s.status === "running" ? { ...s, status: "failed" } : s,
          ),
        }
      : j,
  );
  const j = store.jobs.find((x) => x.id === jobId);
  if (j)
    appendTimeline({
      clientId: j.clientId,
      kind: "deployment",
      severity: "warn",
      message: "Provisioning job cancelled",
    });
  emit();
  return { success: true, message: "Provisioning job cancelled", jobId };
}

export async function retryProvisioningJob({
  jobId,
}: {
  jobId: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  store.jobs = store.jobs.map((j) =>
    j.id === jobId
      ? {
          ...j,
          status: "running",
          progress: 0,
          completedAt: undefined,
          steps: freshSteps(),
        }
      : j,
  );
  const j = store.jobs.find((x) => x.id === jobId);
  if (j)
    appendTimeline({
      clientId: j.clientId,
      kind: "deployment",
      severity: "info",
      message: "Provisioning job retry started",
    });
  emit();
  return { success: true, message: "Retry started", jobId };
}

// Called by the queue page's ticker. Exported so the page stays a thin shell.
export function tickProvisioning() {
  let changed = false;
  store.jobs = store.jobs.map((job) => {
    if (job.status !== "running") return job;
    const idx = job.steps.findIndex((s) => s.status === "running");
    if (idx === -1) return job;
    changed = true;
    const next = job.steps.map((s, i) =>
      i === idx
        ? { ...s, status: "success" as const }
        : i === idx + 1
        ? { ...s, status: "running" as const }
        : s,
    );
    const completed = next.filter((s) => s.status === "success").length;
    const progress = Math.round((completed / next.length) * 100);
    const finished = next.every((s) => s.status === "success");
    if (finished) {
      appendTimeline({
        clientId: job.clientId,
        kind: "deployment",
        severity: "success",
        message: "Stack provisioned successfully",
      });
    }
    return {
      ...job,
      steps: next,
      progress,
      status: finished ? "success" : "running",
      completedAt: finished ? "just now" : job.completedAt,
    };
  });
  if (changed) emit();
}

// ---------------- Stack templates ----------------

export async function createStackTemplate(input: {
  name: string;
  description?: string;
  services?: StackTemplate["services"];
}): Promise<PlatformActionResult> {
  await mockDelay();
  const tpl: StackTemplate = {
    id: newId("tpl"),
    name: input.name,
    description: input.description ?? "Custom stack template",
    services: input.services ?? ["website", "analytics"],
    enabled: true,
  };
  store.templates = [...store.templates, tpl];
  emit();
  return { success: true, message: "Template created", templateId: tpl.id };
}

export async function updateStackTemplate(input: {
  templateId: string;
  patch: Partial<StackTemplate>;
}): Promise<PlatformActionResult> {
  await mockDelay();
  store.templates = store.templates.map((t) =>
    t.id === input.templateId ? { ...t, ...input.patch } : t,
  );
  emit();
  return { success: true, message: "Template updated", templateId: input.templateId };
}

export async function cloneStackTemplate({
  templateId,
}: {
  templateId: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  const src = store.templates.find((t) => t.id === templateId);
  if (!src) return { success: false, message: "Template not found", error: "not_found" };
  const tpl: StackTemplate = { ...src, id: newId("tpl"), name: `${src.name} (copy)` };
  store.templates = [...store.templates, tpl];
  emit();
  return { success: true, message: "Template cloned", templateId: tpl.id };
}

export async function disableStackTemplate({
  templateId,
}: {
  templateId: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  store.templates = store.templates.map((t) =>
    t.id === templateId ? { ...t, enabled: !t.enabled } : t,
  );
  emit();
  return { success: true, message: "Template state updated", templateId };
}

// ---------------- Workspaces & environments ----------------

export async function createClientWorkspace(input: {
  clientId: string;
  name: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Workspace "${input.name}" created`, workspaceId: newId("ws") };
}

export async function createEnvironment(input: {
  workspaceId: string;
  kind: EnvKind;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return {
    success: true,
    message: `${input.kind} environment created`,
    environmentId: newId("env"),
  };
}

export async function pauseStack(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  store.pausedEnvs.add(input.environmentId);
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "alert",
      severity: "warn",
      message: "Stack paused",
    });
  emit();
  return { success: true, message: "Stack paused" };
}

export async function resumeStack(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  store.pausedEnvs.delete(input.environmentId);
  emit();
  return { success: true, message: "Stack resumed" };
}

export async function promotePreviewToProduction(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "success",
      message: "Preview promoted to production",
    });
  emit();
  return { success: true, message: "Preview promoted to production", deploymentId: newId("dp") };
}

export async function runDatabaseBackup(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay(700, 1500);
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "success",
      message: "Database backup completed",
    });
  emit();
  return { success: true, message: "Database backup completed" };
}

// ---------------- Deployments & services ----------------

export async function deployEnvironment(input: {
  environmentId: string;
  clientId?: string;
  envLabel?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "info",
      message: `Deployment started${input.envLabel ? ` for ${input.envLabel}` : ""}`,
    });
  emit();
  return {
    success: true,
    message: `Deployment started${input.envLabel ? ` for ${input.envLabel}` : ""}`,
    deploymentId: newId("dp"),
  };
}

export async function redeployEnvironment(input: {
  environmentId: string;
  clientId?: string;
  envLabel?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "info",
      message: `Redeploy started${input.envLabel ? ` for ${input.envLabel}` : ""}`,
    });
  emit();
  return {
    success: true,
    message: `Redeploy started${input.envLabel ? ` for ${input.envLabel}` : ""}`,
    deploymentId: newId("dp"),
  };
}

export async function rollbackDeployment(input: {
  deploymentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "warn",
      message: `Rollback started for ${input.deploymentId}`,
    });
  emit();
  return { success: true, message: "Rollback started", deploymentId: input.deploymentId };
}

export async function restartService(input: {
  serviceId: string;
  serviceName?: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "alert",
      severity: "info",
      message: `Service restart queued: ${input.serviceName ?? input.serviceId}`,
    });
  emit();
  return {
    success: true,
    message: `Restarting ${input.serviceName ?? "service"}`,
    serviceId: input.serviceId,
  };
}

export async function restartAllServices(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "alert",
      severity: "info",
      message: "All services restart queued",
    });
  emit();
  return { success: true, message: "All services restart queued" };
}

export async function openServiceLogs(input: {
  serviceId?: string;
  environmentId?: string;
  serviceName?: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 350);
  return {
    success: true,
    message: `Opening logs${input.serviceName ? ` for ${input.serviceName}` : ""}`,
    logsUrl: `/logs/${input.serviceId ?? input.environmentId ?? "all"}`,
  };
}

export async function rebuildWebsite(input: {
  environmentId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "deployment",
      severity: "info",
      message: "Website rebuild started",
    });
  emit();
  return { success: true, message: "Website rebuild started" };
}

// ---------------- Domains ----------------

export async function addDomain(input: {
  host: string;
  environmentId: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Domain ${input.host} added`, domainId: newId("dom") };
}

export async function verifyDomain(input: {
  domainId: string;
  host?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (maybeFail(0.1))
    return {
      success: false,
      message: "DNS verification failed",
      error: "Missing CNAME record",
    };
  return {
    success: true,
    message: `DNS verification started${input.host ? ` for ${input.host}` : ""}`,
    domainId: input.domainId,
  };
}

export async function renewSsl(input: {
  domainId: string;
  host?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return {
    success: true,
    message: `SSL renewal queued${input.host ? ` for ${input.host}` : ""}`,
    domainId: input.domainId,
  };
}

export async function manageRedirects(input: {
  domainId: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 300);
  return {
    success: true,
    message: "Opening redirects editor",
    domainId: input.domainId,
    externalUrl: `/domains/${input.domainId}/redirects`,
  };
}

// ---------------- Secrets & env vars ----------------

export async function createSecret(input: {
  environmentId: string;
  key: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Secret ${input.key} created`, secretId: newId("sec") };
}

export async function rotateSecret(input: {
  secretId: string;
  key?: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "alert",
      severity: "info",
      message: `Secret rotated${input.key ? `: ${input.key}` : ""}`,
    });
  emit();
  return {
    success: true,
    message: `Secret rotation queued${input.key ? ` for ${input.key}` : ""}`,
    secretId: input.secretId,
  };
}

export async function revokeSecret(input: {
  secretId: string;
  key?: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "alert",
      severity: "warn",
      message: `Secret revoked${input.key ? `: ${input.key}` : ""}`,
    });
  emit();
  return { success: true, message: "Secret revoked", secretId: input.secretId };
}

export async function addEnvVar(input: {
  environmentId: string;
  key: string;
  value?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Variable ${input.key} added` };
}

export async function deleteEnvVar(input: {
  environmentId: string;
  key: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Variable ${input.key} deleted` };
}

// ---------------- Integrations / automations ----------------

export async function connectIntegration(input: {
  providerId: string;
  clientId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  if (input.clientId)
    appendTimeline({
      clientId: input.clientId,
      kind: "integration",
      severity: "success",
      message: `${input.providerId} connected`,
    });
  emit();
  return { success: true, message: `${input.providerId} connection started` };
}

export async function openIntegrationDetails(input: {
  integrationId: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 300);
  return { success: true, message: "Opening integration details", externalUrl: `/integrations/${input.integrationId}` };
}

export async function openN8n(input: {
  environmentId?: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 300);
  return {
    success: true,
    message: "Opening n8n",
    externalUrl: `https://n8n.example/${input.environmentId ?? ""}`,
  };
}

export async function inspectWorkflow(input: {
  workflowId: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 300);
  return { success: true, message: `Inspecting workflow ${input.workflowId}`, externalUrl: `/workflows/${input.workflowId}` };
}

// ---------------- Billing / usage / settings ----------------

export async function upgradePlan(input: {
  clientId: string;
  plan: string;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `Upgrade to ${input.plan} initiated` };
}

export async function viewInvoices(input: {
  clientId: string;
}): Promise<PlatformActionResult> {
  await mockDelay(150, 300);
  return { success: true, message: "Opening invoices", externalUrl: `/clients/${input.clientId}/invoices` };
}

export async function recordUsageEvent(input: {
  clientId: string;
  metric: string;
  amount: number;
}): Promise<PlatformActionResult> {
  await mockDelay(50, 150);
  return { success: true, message: `Recorded ${input.amount} ${input.metric}` };
}

export async function saveSettings(input: {
  scope: string;
  payload: Record<string, unknown>;
}): Promise<PlatformActionResult> {
  await mockDelay();
  return { success: true, message: `${input.scope} settings saved` };
}
