import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { DateRangeToggle } from "@/components/portal/DateRangeToggle";
import { KpiCard } from "@/components/portal/KpiCard";
import { AreaTrend, BarTrend } from "@/components/portal/MetricChart";
import { trendSeries } from "@/lib/mock/portal";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Columbus AI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const n = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 30 : 12;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="A unified view of your website, leads, automations, and AI activity."
        actions={<DateRangeToggle value={range} onChange={setRange} options={["7d", "30d", "90d", "Year"]} />}
      />

      <div className="surface-card p-6 bg-gradient-to-br from-[color:var(--accent)]/10 to-[color:var(--chart-4)]/10 border-[color:var(--accent)]/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--chart-4)] text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated time saved</p>
            <p className="text-3xl font-semibold mt-1">142 hours</p>
            <p className="text-sm text-muted-foreground mt-1">
              That's how much front-desk work your automations handled this month.
            </p>
          </div>
        </div>
      </div>

      <Section title="Website Traffic">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Visitors" value="4,128" hint="+12% vs prev." />
          <KpiCard label="Leads" value="42" hint="+18%" />
          <KpiCard label="Conversion Rate" value="1.02%" />
          <KpiCard label="Avg. Session" value="2m 14s" />
        </div>
        <div className="surface-card p-5 mt-4">
          <AreaTrend data={trendSeries(n, 180)} />
        </div>
      </Section>

      <Section title="Automation Performance">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Automation Runs" value="1,718" />
          <KpiCard label="Failed Runs" value="9" accent="attention" />
          <KpiCard label="Success Rate" value="99.5%" accent="online" />
          <KpiCard label="Avg. Run Time" value="1.4s" />
        </div>
        <div className="surface-card p-5 mt-4">
          <BarTrend data={trendSeries(n, 60)} color="var(--chart-2)" />
        </div>
      </Section>

      <Section title="AI Chat Usage">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="AI Conversations" value="312" hint="This period" />
          <KpiCard label="Avg. Reply Time" value="0.8s" />
          <KpiCard label="Satisfied Replies" value="94%" accent="online" />
        </div>
        <div className="surface-card p-5 mt-4">
          <AreaTrend data={trendSeries(n, 12, 0.5)} color="var(--chart-4)" />
        </div>
      </Section>

      <Section title="Integration Activity">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Records Synced" value="8,421" />
          <KpiCard label="Sync Errors" value="2" accent="attention" />
          <KpiCard label="Active Integrations" value="7 / 9" />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
