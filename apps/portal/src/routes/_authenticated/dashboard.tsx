import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  CalendarCheck,
  Workflow,
  Clock,
  Star,
  DollarSign,
  Activity,
  Globe,
  CheckCircle2,
  LifeBuoy,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  Inbox,
  ChevronRight,
  Plus,
  FileBarChart2,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { KpiCard } from "@/components/portal/KpiCard";
import { StatusPill } from "@/components/portal/StatusPill";
import { activity, businessImpact, client, monthInReview, services } from "@/lib/mock/portal";
import { useWorkItems } from "@/hooks/useWorkItems";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import { formatRelative } from "@/data/utils";
import { get as getUser } from "@/data/repositories/users";
import { WorkStatusPill } from "@/components/work/WorkStatusPill";
import { WorkTypeBadge } from "@/components/work/WorkTypeBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Columbus AI" }] }),
  component: Dashboard,
});

const activityIcon = {
  website: Globe,
  automation: Workflow,
  lead: Users,
  invoice: CreditCard,
  integration: CheckCircle2,
  support: LifeBuoy,
} as const;

const impactCards = [
  { label: "Leads Captured", value: businessImpact.leadsCaptured, icon: Users },
  { label: "Appointments Booked", value: businessImpact.appointmentsBooked, icon: CalendarCheck },
  { label: "Tasks Automated", value: businessImpact.tasksAutomated, icon: Workflow },
  { label: "Hours Saved", value: businessImpact.hoursSaved, icon: Clock },
  { label: "Reviews Generated", value: businessImpact.reviewsGenerated, icon: Star },
];

const roiRows = [
  { label: "Leads Generated", value: businessImpact.leadsCaptured.toString(), icon: Users },
  {
    label: "Appointments Scheduled",
    value: businessImpact.appointmentsBooked.toString(),
    icon: CalendarCheck,
  },
  {
    label: "Estimated Revenue Influenced",
    value: `$${businessImpact.revenueInfluenced.toLocaleString()}`,
    icon: DollarSign,
  },
  {
    label: "Follow-Ups Automated",
    value: businessImpact.followUpsAutomated.toString(),
    icon: Workflow,
  },
  { label: "Hours Saved", value: `${businessImpact.hoursSaved}h`, icon: Clock },
];

function formatValue(n: number, fmt: "number" | "percent" | "hours") {
  if (fmt === "hours") return `${n}h`;
  if (fmt === "percent") return `${n}%`;
  return n.toLocaleString();
}

function delta(current: number, previous: number) {
  if (previous === 0) return { abs: current, pct: 100, up: current >= 0 };
  const abs = current - previous;
  const pct = Math.round((abs / previous) * 100);
  return { abs, pct, up: abs >= 0 };
}

function Dashboard() {
  const { activeClientId } = usePortalWorkspace();
  const allWork = useWorkItems({ clientId: activeClientId ?? undefined });
  const activeRequests = allWork
    .filter((w) => !["completed", "cancelled"].includes(w.status))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${client.name.split(" ")[0]}`}
        description="Here's what Columbus AI is doing for your business this month."
        actions={
          <Button asChild>
            <Link to="/requests">
              <Plus className="mr-2 h-4 w-4" />
              New request
            </Link>
          </Button>
        }
      />

      {/* Business impact KPIs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Business Impact This Month</h2>
            <p className="text-xs text-muted-foreground">
              What Columbus AI delivered for {client.name} in {monthInReview.period}.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {impactCards.map((c) => (
            <KpiCard key={c.label} label={c.label} value={c.value.toLocaleString()} icon={c.icon} />
          ))}
        </div>
      </section>

      {/* Month in review + ROI */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 surface-card p-6 bg-gradient-to-br from-[color:var(--accent)]/8 to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[color:var(--accent)] font-semibold">
                Your Month In Review
              </p>
              <h3 className="mt-1 text-xl font-semibold">{monthInReview.period}</h3>
              <p className="text-xs text-muted-foreground">
                Compared to {monthInReview.comparedTo}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/reports">
                <FileBarChart2 className="mr-1.5 h-3.5 w-3.5" /> Full report
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
            {monthInReview.metrics.map((m) => {
              const d = delta(m.current, m.previous);
              return (
                <div
                  key={m.label}
                  className="rounded-lg border border-border bg-surface-elevated/40 p-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{formatValue(m.current, m.format)}</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${d.up ? "text-[color:var(--status-online)]" : "text-[color:var(--status-issue)]"}`}
                  >
                    <ArrowUpRight className={`h-3 w-3 ${d.up ? "" : "rotate-180"}`} />
                    {d.up ? "+" : ""}
                    {m.format === "number"
                      ? d.abs.toLocaleString()
                      : formatValue(d.abs, m.format)}{" "}
                    ({d.pct >= 0 ? "+" : ""}
                    {d.pct}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Estimated Business Impact
          </p>
          <h3 className="mt-1 text-base font-semibold">Value delivered</h3>
          <ul className="mt-4 space-y-3">
            {roiRows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <r.icon className="h-3.5 w-3.5" />
                  {r.label}
                </span>
                <span className="text-sm font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Active requests + activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-semibold">Active requests</h3>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link to="/requests">
                View all <ChevronRight className="ml-0.5 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {activeRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active requests.</p>
          ) : (
            <ul className="space-y-2.5">
              {activeRequests.map((w) => {
                const assignee = getUser(w.primaryAssigneeId);
                return (
                  <li key={w.id}>
                    <Link
                      to="/requests/$id"
                      params={{ id: w.id }}
                      className="block rounded-lg border border-border bg-surface-elevated/40 p-3 hover:border-[color:var(--accent)]/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{w.title}</p>
                        <WorkStatusPill status={w.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <WorkTypeBadge type={w.type} />
                        <span className="text-xs text-muted-foreground">
                          {assignee ? assignee.name : "Unassigned"} · {formatRelative(w.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 surface-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-semibold">Recent activity</h3>
            </div>
          </div>
          <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {activity.map((a) => {
              const Icon = activityIcon[a.kind];
              return (
                <li key={a.id} className="relative flex items-start gap-4 pl-0">
                  <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{a.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {a.at}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Service catalog */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              What Columbus AI is doing for you
            </h2>
            <p className="text-xs text-muted-foreground">Included in your {client.plan}.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/billing">
              View plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="surface-card p-4 flex flex-col gap-2 hover:border-[color:var(--accent)]/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold leading-tight">{s.name}</h4>
                <StatusPill tone="online">{s.status}</StatusPill>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
              <p className="mt-auto text-[11px] text-muted-foreground">Updated {s.lastUpdated}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
