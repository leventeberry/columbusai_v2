import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { clients, type Client } from "@/lib/mock/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WorkspaceSwitcher } from "@/components/platform/workspace-switcher";
import { HealthTimeline } from "@/components/platform/health-timeline";
import { ConfirmDialog } from "@/components/platform/confirm-dialog";
import { workspacesFor, environments as allEnvs } from "@/lib/mock/platform";
import * as api from "@/lib/platform-api";
import {
  ArrowLeft,
  Activity,
  Box,
  Globe,
  Workflow,
  Plug,
  Database,
  Rocket,
  ScrollText,
  CreditCard,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Zap,
  ExternalLink,
  Copy,
  RotateCw,
  Power,
  GitBranch,
} from "lucide-react";

async function run<T extends api.PlatformActionResult>(p: Promise<T>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

export const Route = createFileRoute("/_app/clients/$clientId")({
  head: ({ params }) => ({ meta: [{ title: `Client · ${params.clientId} — Columbus AI` }] }),
  loader: ({ params }) => {
    const c = clients.find((x) => x.id === params.clientId);
    if (!c) throw notFound();
    return c;
  },
  component: ClientDetail,
  notFoundComponent: () => (
    <div className="py-16 text-center text-sm text-muted-foreground">Client not found.</div>
  ),
});

// ---------- shared bits ----------

function StatusDot({ tone }: { tone: "ok" | "warn" | "err" | "idle" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500 shadow-[0_0_10px_oklch(0.7_0.18_150/0.6)]"
      : tone === "warn"
        ? "bg-amber-500 shadow-[0_0_10px_oklch(0.78_0.16_75/0.6)]"
        : tone === "err"
          ? "bg-rose-500 shadow-[0_0_10px_oklch(0.65_0.22_25/0.6)]"
          : "bg-muted-foreground/60";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card/40 p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function KV({ k, v, mono = false }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{v}</span>
    </div>
  );
}

// ---------- per-client mock derivation ----------

function mockFor(c: ReturnType<typeof clientFromLoader>) {
  const slug = c.name.toLowerCase().replace(/[^a-z]+/g, "-");
  const domain = `${slug}.io`;
  return {
    domain,
    stackTemplate:
      c.automations > 30
        ? "Full AI Stack"
        : c.automations > 10
          ? "Automation Stack"
          : "Basic Website Stack",
    region: "iad1 · US East",
    plan: c.monthlyValue > 25000 ? "Scale" : c.monthlyValue > 15000 ? "Growth" : "Starter",
    websiteUrl: `https://${domain}`,
    services: [
      {
        name: "Web",
        icon: Globe,
        status: "running",
        detail: "Next.js · 3 instances",
        tone: "ok" as const,
      },
      {
        name: "n8n",
        icon: Workflow,
        status: c.automations > 10 ? "running" : "disabled",
        detail: c.automations > 10 ? `${c.automations} workflows` : "Not provisioned",
        tone: (c.automations > 10 ? "ok" : "idle") as "ok" | "idle",
      },
      {
        name: "Postgres",
        icon: Database,
        status: "running",
        detail: "v16 · 4.2 GB / 20 GB",
        tone: "ok" as const,
      },
      {
        name: "Redis",
        icon: Zap,
        status: c.health < 70 ? "degraded" : "running",
        detail: c.health < 70 ? "Memory 92%" : "Memory 41%",
        tone: (c.health < 70 ? "warn" : "ok") as "warn" | "ok",
      },
      {
        name: "Vector DB",
        icon: HardDrive,
        status: c.automations > 30 ? "running" : "disabled",
        detail: c.automations > 30 ? "Qdrant · 184k vectors" : "Not provisioned",
        tone: (c.automations > 30 ? "ok" : "idle") as "ok" | "idle",
      },
      {
        name: "AI Agent",
        icon: Cpu,
        status: c.automations > 30 ? "running" : "disabled",
        detail: c.automations > 30 ? "Claude · 12k req/day" : "Not provisioned",
        tone: (c.automations > 30 ? "ok" : "idle") as "ok" | "idle",
      },
    ],
    integrations: [
      { name: "Stripe", connected: true, scope: "Payments · webhooks" },
      { name: "HubSpot", connected: c.industry !== "Energy", scope: "CRM sync" },
      { name: "Slack", connected: true, scope: "#alerts" },
      { name: "Google Analytics", connected: true, scope: "Web analytics" },
      { name: "Twilio", connected: c.automations > 20, scope: "SMS · voice" },
      { name: "SendGrid", connected: true, scope: "Transactional email" },
    ],
    deployments: [
      {
        id: "dp1",
        version: "v2024.11.04",
        env: "production",
        status: "success",
        at: "Today, 09:14",
        by: "CI",
      },
      {
        id: "dp2",
        version: "v2024.11.03",
        env: "preview",
        status: "success",
        at: "Yesterday, 18:02",
        by: "Maya L.",
      },
      {
        id: "dp3",
        version: "v2024.11.02",
        env: "production",
        status: "failed",
        at: "Yesterday, 11:48",
        by: "Theo R.",
      },
      {
        id: "dp4",
        version: "v2024.11.01",
        env: "production",
        status: "success",
        at: "Oct 29, 16:20",
        by: "CI",
      },
    ],
    logs: [
      { t: "12:04:21", level: "info", source: "web", msg: "GET /api/leads 200 · 84ms" },
      { t: "12:04:18", level: "info", source: "n8n", msg: 'Workflow "CRM Sync" completed in 1.2s' },
      {
        t: "12:04:11",
        level: "warn",
        source: "redis",
        msg: "Eviction triggered · 12 keys removed",
      },
      {
        t: "12:04:02",
        level: "info",
        source: "agent",
        msg: "Resolved ticket #4821 (sentiment: positive)",
      },
      {
        t: "12:03:58",
        level: "error",
        source: "n8n",
        msg: "Webhook delivery failed · retrying (2/5)",
      },
      {
        t: "12:03:44",
        level: "info",
        source: "postgres",
        msg: "Autovacuum complete on public.events",
      },
    ],
    envVars: [
      { key: "DATABASE_URL", masked: true },
      { key: "REDIS_URL", masked: true },
      { key: "STRIPE_SECRET_KEY", masked: true },
      { key: "OPENAI_API_KEY", masked: true },
      { key: "N8N_WEBHOOK_BASE", masked: false, value: `https://n8n.${domain}` },
    ],
  };
}

function clientFromLoader() {
  // helper for typing only — actual data comes from Route.useLoaderData()
  return clients[0];
}

// ---------- main ----------

function ClientDetail() {
  const c = Route.useLoaderData() as Client;
  const m = mockFor(c);

  const wsList = workspacesFor(c.id);
  const [workspaceId, setWorkspaceId] = useState(wsList[0]?.id ?? "");
  const envsForWs = allEnvs.filter((e) => e.workspaceId === workspaceId);
  const [environmentId, setEnvironmentId] = useState(envsForWs[0]?.id ?? "");
  const env = allEnvs.find((e) => e.id === environmentId) ?? envsForWs[0];
  api.usePlatformVersion();
  const events = api.getTimeline(c.id);

  const handleWs = (id: string) => {
    setWorkspaceId(id);
    const first = allEnvs.find((e) => e.workspaceId === id);
    if (first) setEnvironmentId(first.id);
  };

  const envLabel = env ? env.kind[0].toUpperCase() + env.kind.slice(1) : "";
  const envId = env?.id ?? "";

  return (
    <div className="space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to clients
      </Link>

      {/* Header with infra identity */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <PageHeader
            title={c.name}
            subtitle={`${m.stackTemplate} · ${env?.region ?? m.region} · ${m.plan} plan`}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1.5">
              <StatusDot tone="ok" /> {c.status}
            </Badge>
            <a
              href={env ? `https://${env.domain}` : m.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/40 px-2 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              {env?.domain ?? m.domain} <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground">Owner · {c.owner}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WorkspaceSwitcher
            workspaces={wsList}
            environments={allEnvs}
            workspaceId={workspaceId}
            environmentId={environmentId}
            onWorkspaceChange={handleWs}
            onEnvironmentChange={setEnvironmentId}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              run(api.redeployEnvironment({ environmentId: envId, clientId: c.id, envLabel }))
            }
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Redeploy
          </Button>
          <Button
            size="sm"
            onClick={() =>
              run(api.deployEnvironment({ environmentId: envId, clientId: c.id, envLabel }))
            }
          >
            <Rocket className="mr-1.5 h-3.5 w-3.5" /> Deploy
          </Button>
        </div>
      </div>

      {/* Infra KPIs */}
      <div className="grid gap-3 md:grid-cols-5">
        {[
          { label: "Health", value: `${c.health}`, sub: "/ 100", icon: Activity },
          {
            label: "Services up",
            value: `${m.services.filter((s) => s.tone === "ok").length}/${m.services.length}`,
            icon: Box,
          },
          { label: "Uptime 30d", value: "99.98%", icon: CheckCircle2 },
          { label: "p95 latency", value: "142ms", icon: Zap },
          { label: "MRR", value: `$${c.monthlyValue.toLocaleString()}`, icon: CreditCard },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="mt-1 font-mono text-xl font-semibold">
              {s.value}
              {"sub" in s && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {(s as { sub?: string }).sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stack">
            <Box className="mr-1.5 h-3.5 w-3.5" />
            Stack
          </TabsTrigger>
          <TabsTrigger value="services">
            <Cpu className="mr-1.5 h-3.5 w-3.5" />
            Services
          </TabsTrigger>
          <TabsTrigger value="website">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            Website
          </TabsTrigger>
          <TabsTrigger value="automations">
            <Workflow className="mr-1.5 h-3.5 w-3.5" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="mr-1.5 h-3.5 w-3.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-1.5 h-3.5 w-3.5" />
            Data
          </TabsTrigger>
          <TabsTrigger value="deployments">
            <Rocket className="mr-1.5 h-3.5 w-3.5" />
            Deployments
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="mr-1.5 h-3.5 w-3.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-1.5 h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Services" className="lg:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {m.services.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-md border border-border/60 bg-card/60">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.detail}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                    <StatusDot tone={s.tone} /> {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Health">
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Overall</span>
                  <span className="font-mono">{c.health}/100</span>
                </div>
                <Progress value={c.health} />
              </div>
              <KV k="CPU" v="38%" />
              <KV k="Memory" v="2.4 / 8 GB" />
              <KV k="Error rate (24h)" v="0.12%" />
              <KV k="Last incident" v="None in 30d" />
            </div>
          </Card>

          <Card title="Client health timeline" className="lg:col-span-2">
            <HealthTimeline events={events} />
          </Card>

          <Card title="Quick actions">
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() =>
                  run(api.restartAllServices({ environmentId: envId, clientId: c.id }))
                }
              >
                <RotateCw className="mr-2 h-3.5 w-3.5" />
                Restart services
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() =>
                  run(api.promotePreviewToProduction({ environmentId: envId, clientId: c.id }))
                }
              >
                <GitBranch className="mr-2 h-3.5 w-3.5" />
                Promote preview → prod
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => run(api.runDatabaseBackup({ environmentId: envId, clientId: c.id }))}
              >
                <Database className="mr-2 h-3.5 w-3.5" />
                Run database backup
              </Button>
              <ConfirmDialog
                title="Pause stack?"
                description="All services for this environment will stop. Data is retained."
                impact={["Website goes offline", "Workflows pause", "Background jobs halt"]}
                confirmLabel="Pause stack"
                variant="danger"
                onConfirm={() => run(api.pauseStack({ environmentId: envId, clientId: c.id }))}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-rose-400 hover:text-rose-300"
                  >
                    <Power className="mr-2 h-3.5 w-3.5" />
                    Pause stack
                  </Button>
                }
              />
            </div>
          </Card>
        </TabsContent>

        {/* Stack */}
        <TabsContent value="stack" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Template" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">{m.stackTemplate}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Provisioned in {m.region} · Plan {m.plan}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change template
              </Button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {m.services.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4" />
                    <span className="text-sm">{s.name}</span>
                  </div>
                  <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                    <StatusDot tone={s.tone} /> {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Environment">
            <KV k="Region" v={m.region} />
            <KV k="Runtime" v="Node 26" mono />
            <KV k="Container" v="ghcr.io/columbus/stack:11.4" mono />
            <KV k="Provisioned" v="Sep 14, 2024" />
            <KV k="Last sync" v="2m ago" />
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="mt-4">
          <Card
            title="Running services"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.createEnvironment({ workspaceId, kind: "production" }))}
              >
                Add service
              </Button>
            }
          >
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Detail</th>
                    <th className="px-3 py-2 text-left">CPU</th>
                    <th className="px-3 py-2 text-left">Memory</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {m.services.map((s, i) => (
                    <tr key={s.name} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <s.icon className="h-4 w-4 text-muted-foreground" />
                          {s.name}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                          <StatusDot tone={s.tone} /> {s.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{s.detail}</td>
                      <td className="px-3 py-2 font-mono text-xs">{20 + ((i * 13) % 60)}%</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {(0.4 + i * 0.3).toFixed(1)} GB
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            run(
                              api.restartService({
                                serviceId: `${envId}-${s.name}`,
                                serviceName: s.name,
                                clientId: c.id,
                              }),
                            )
                          }
                        >
                          Restart
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            run(
                              api.openServiceLogs({
                                serviceId: `${envId}-${s.name}`,
                                serviceName: s.name,
                              }),
                            )
                          }
                        >
                          Logs
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Website */}
        <TabsContent value="website" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Domain" className="lg:col-span-2">
            <KV k="Primary domain" v={<span className="font-mono">{m.domain}</span>} />
            <KV
              k="SSL"
              v={
                <Badge variant="outline" className="gap-1.5">
                  <StatusDot tone="ok" /> Active · auto-renews
                </Badge>
              }
            />
            <KV k="CDN" v="Cloudflare · 14 PoPs" />
            <KV k="Framework" v="Next.js 15" />
            <KV k="Last build" v="Today, 09:14" />
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`https://${env?.domain ?? m.domain}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Visit site
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.rebuildWebsite({ environmentId: envId, clientId: c.id }))}
              >
                <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                Rebuild
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.manageRedirects({ domainId: envId }))}
              >
                Manage DNS
              </Button>
            </div>
          </Card>
          <Card title="Traffic (24h)">
            <KV k="Visitors" v="4,128" mono />
            <KV k="Pageviews" v="11,902" mono />
            <KV k="Bounce" v="38%" mono />
            <KV k="p95 TTFB" v="142ms" mono />
          </Card>
        </TabsContent>

        {/* Automations */}
        <TabsContent value="automations" className="mt-4">
          <Card
            title="n8n workflows"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.openN8n({ environmentId: envId }))}
              >
                Open n8n
              </Button>
            }
          >
            <div className="space-y-2">
              {[
                {
                  name: "Inbound Lead Enrichment",
                  runs: 1284,
                  success: 99.2,
                  status: "ok" as const,
                },
                { name: "Invoice Reconciliation", runs: 612, success: 97.8, status: "ok" as const },
                { name: "Document Intake OCR", runs: 421, success: 92.1, status: "warn" as const },
                { name: "CRM Sync — HubSpot", runs: 902, success: 99.6, status: "ok" as const },
                { name: "Churn Risk Scorer", runs: 188, success: 98.4, status: "ok" as const },
              ].map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot tone={w.status} />
                    <div>
                      <div className="text-sm font-medium">{w.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {w.runs.toLocaleString()} runs · {w.success}% success
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => run(api.inspectWorkflow({ workflowId: w.name }))}
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4">
          <Card
            title="Connected services"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.connectIntegration({ providerId: "new", clientId: c.id }))}
              >
                Connect new
              </Button>
            }
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {m.integrations.map((i) => (
                <div
                  key={i.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div>
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.scope}</div>
                  </div>
                  {i.connected ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => run(api.openIntegrationDetails({ integrationId: i.name }))}
                    >
                      <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                        <StatusDot tone="ok" /> Connected
                      </Badge>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(api.connectIntegration({ providerId: i.name, clientId: c.id }))
                      }
                    >
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Postgres" className="lg:col-span-2">
            <KV k="Version" v="16.4" mono />
            <KV k="Storage" v="4.2 / 20 GB" />
            <Progress value={21} className="mt-1" />
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <KV k="Connections" v="14 / 100" />
              <KV k="QPS" v="312" />
              <KV k="Cache hit" v="98.7%" />
              <KV k="Last backup" v="03:00 UTC" />
            </div>
          </Card>
          <Card title="Vector DB">
            <KV k="Engine" v="Qdrant" />
            <KV k="Vectors" v="184,210" mono />
            <KV k="Collections" v="6" mono />
            <KV k="Disk" v="1.8 GB" />
          </Card>
          <Card title="Redis" className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KV k="Memory" v="1.7 / 4 GB" />
              <KV k="Ops/sec" v="2,418" mono />
              <KV k="Hit rate" v="96.2%" />
              <KV k="Evictions (1h)" v="12" />
            </div>
          </Card>
        </TabsContent>

        {/* Deployments */}
        <TabsContent value="deployments" className="mt-4">
          <Card
            title="Recent deployments"
            action={
              <Button
                size="sm"
                onClick={() =>
                  run(api.deployEnvironment({ environmentId: envId, clientId: c.id, envLabel }))
                }
              >
                Deploy
              </Button>
            }
          >
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Version</th>
                    <th className="px-3 py-2 text-left">Environment</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">By</th>
                    <th className="px-3 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {m.deployments.map((d) => (
                    <tr key={d.id} className="border-t border-border/60">
                      <td className="px-3 py-2 font-mono text-xs">{d.version}</td>
                      <td className="px-3 py-2 capitalize">{d.env}</td>
                      <td className="px-3 py-2">
                        {d.status === "success" ? (
                          <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Success
                          </Badge>
                        ) : d.status === "failed" ? (
                          <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                            <XCircle className="h-3 w-3 text-rose-500" /> Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1.5 text-[10px] uppercase">
                            <Clock className="h-3 w-3 text-amber-500" /> Running
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{d.at}</td>
                      <td className="px-3 py-2">{d.by}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            run(
                              api.openServiceLogs({ environmentId: envId, serviceName: d.version }),
                            )
                          }
                        >
                          Logs
                        </Button>
                        <ConfirmDialog
                          title={`Rollback ${d.version}?`}
                          description="Traffic will switch back to this version."
                          impact={[
                            "Active deployment will be replaced",
                            "In-flight requests may fail briefly",
                          ]}
                          confirmLabel="Rollback"
                          variant="danger"
                          onConfirm={() =>
                            run(api.rollbackDeployment({ deploymentId: d.id, clientId: c.id }))
                          }
                          trigger={
                            <Button variant="ghost" size="sm">
                              Rollback
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card
            title="Live logs"
            action={
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <StatusDot tone="ok" /> streaming
              </div>
            }
          >
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs">
              {m.logs.map((l, i) => (
                <div key={i} className="flex gap-3 py-0.5">
                  <span className="text-muted-foreground">{l.t}</span>
                  <span
                    className={
                      l.level === "error"
                        ? "text-rose-400"
                        : l.level === "warn"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  >
                    {l.level.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">[{l.source}]</span>
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Subscription" className="lg:col-span-2">
            <KV k="Plan" v={m.plan} />
            <KV k="MRR" v={`$${c.monthlyValue.toLocaleString()}`} mono />
            <KV k="Renews" v="Dec 1, 2025" />
            <KV k="Payment method" v="•••• 4242 (Visa)" mono />
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run(
                    api.upgradePlan({
                      clientId: c.id,
                      plan:
                        m.plan === "Scale" ? "Scale+" : m.plan === "Growth" ? "Scale" : "Growth",
                    }),
                  )
                }
              >
                Upgrade plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => run(api.viewInvoices({ clientId: c.id }))}
              >
                View invoices
              </Button>
            </div>
          </Card>
          <Card title="Usage this period">
            <KV k="Compute hours" v="412 / 1,000" />
            <Progress value={41} className="mt-1" />
            <KV k="AI tokens" v="2.1M / 5M" />
            <Progress value={42} className="mt-1" />
            <KV k="Workflow runs" v="3,418 / 10,000" />
            <Progress value={34} className="mt-1" />
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card
            title="Environment variables"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  run(api.addEnvVar({ environmentId: envId, key: `NEW_VAR_${Date.now() % 1000}` }))
                }
              >
                Add variable
              </Button>
            }
          >
            <div className="space-y-2">
              {m.envVars.map((e) => (
                <div
                  key={e.key}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-2 font-mono text-xs"
                >
                  <span>{e.key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {e.masked ? "••••••••••••" : e.value}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(e.value ?? e.key);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDialog
                      title={`Delete ${e.key}?`}
                      description="The variable will be removed at next deploy."
                      confirmLabel="Delete"
                      variant="danger"
                      onConfirm={() => run(api.deleteEnvVar({ environmentId: envId, key: e.key }))}
                      trigger={
                        <Button size="sm" variant="ghost">
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Danger zone">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3">
                <div>
                  <div className="text-sm font-medium">Pause stack</div>
                  <div className="text-xs text-muted-foreground">
                    Stop all services. Data is retained.
                  </div>
                </div>
                <ConfirmDialog
                  title="Pause stack?"
                  description="All services for this environment will stop. Data is retained."
                  impact={["Website goes offline", "Workflows pause", "Background jobs halt"]}
                  confirmLabel="Pause stack"
                  variant="danger"
                  onConfirm={() => run(api.pauseStack({ environmentId: envId, clientId: c.id }))}
                  trigger={
                    <Button size="sm" variant="outline">
                      Pause
                    </Button>
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
                <div>
                  <div className="text-sm font-medium text-rose-300">Destroy stack</div>
                  <div className="text-xs text-muted-foreground">
                    Permanently delete all infrastructure for this client.
                  </div>
                </div>
                <ConfirmDialog
                  title="Destroy stack?"
                  description="This permanently removes every resource for this client."
                  impact={[
                    "All data is deleted",
                    "All domains are released",
                    "This cannot be undone",
                  ]}
                  confirmLabel="Destroy"
                  variant="danger"
                  onConfirm={() => run(api.pauseStack({ environmentId: envId, clientId: c.id }))}
                  trigger={
                    <Button size="sm" variant="destructive">
                      Destroy
                    </Button>
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
