import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ExternalLink,
  ShieldCheck,
  Globe,
  Server,
  Zap,
  Clock,
  Wrench,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/StatusPill";
import { DateRangeToggle } from "@/components/portal/DateRangeToggle";
import { AreaTrend, BarTrend } from "@/components/portal/MetricChart";
import { KpiCard } from "@/components/portal/KpiCard";
import { Button } from "@/components/ui/button";
import { website, websiteAnalytics, trendSeries, workRequests } from "@/lib/mock/portal";

export const Route = createFileRoute("/_authenticated/website")({
  head: () => ({ meta: [{ title: "Website — Columbus AI" }] }),
  component: WebsitePage,
});

function WebsitePage() {
  const [range, setRange] = useState("30d");
  const points = range === "24h" ? 12 : range === "7d" ? 7 : range === "90d" ? 30 : 14;
  const visitorsSeries = trendSeries(points, 200);
  const formsSeries = trendSeries(points, 5, 0.6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website"
        description="System status and visitor analytics for your live website."
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={website.url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit website
              </a>
            </Button>
            <Button asChild>
              <Link to="/requests">
                <Wrench className="mr-2 h-4 w-4" />
                Request website update
              </Link>
            </Button>
          </>
        }
      />

      <section className="surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">System status</h2>
          </div>
          <StatusPill tone="online">Online</StatusPill>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Domain", value: website.domain, icon: Globe },
            { label: "SSL", value: website.sslStatus, icon: ShieldCheck },
            { label: "Uptime (30d)", value: `${website.uptime}%`, icon: Zap },
            { label: "Last website update", value: website.lastDeployment, icon: Clock },
            { label: "Framework", value: website.framework, icon: Server },
            { label: "CDN", value: website.cdnStatus, icon: Zap },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-border bg-surface-elevated/40 p-3.5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <row.icon className="h-3.5 w-3.5" />
                {row.label}
              </div>
              <div className="mt-1.5 font-medium">{row.value}</div>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold">Website analytics</h2>
          <DateRangeToggle value={range} onChange={setRange} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Visitors"
            value={websiteAnalytics.visitors.toLocaleString()}
            hint="Unique"
          />
          <KpiCard label="Form Submissions" value={websiteAnalytics.formSubmissions} />
          <KpiCard
            label="Appointments Booked"
            value={websiteAnalytics.appointmentsBooked}
            icon={CalendarCheck}
            accent="online"
          />
          <KpiCard label="Conversion Rate" value={`${websiteAnalytics.conversionRate}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="surface-card p-5">
            <h3 className="text-sm font-medium mb-3">Visitors over time</h3>
            <AreaTrend data={visitorsSeries} />
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-medium mb-3">Form submissions</h3>
            <BarTrend data={formsSeries} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="surface-card p-5">
            <h3 className="text-sm font-medium mb-3">Top pages</h3>
            <ul className="divide-y divide-border">
              {websiteAnalytics.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-mono text-muted-foreground">{p.path}</span>
                  <span className="font-medium">{p.views.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-medium mb-3">Traffic sources</h3>
            <ul className="space-y-3">
              {websiteAnalytics.sources.map((s) => (
                <li key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--chart-4)]"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" />
              Website improvements completed
            </h3>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link to="/requests">Request a change</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {websiteAnalytics.recentChanges.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.by}</p>
                </div>
                <span className="text-xs text-muted-foreground">{c.at}</span>
              </li>
            ))}
            {workRequests
              .filter((r) => r.category === "Website" && r.status === "Completed")
              .map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">Request {r.id}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.lastUpdate}</span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
