import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usageFor } from "@/lib/mock/platform";

type Range = "24h" | "7d" | "30d" | "90d";

export const Route = createFileRoute("/_app/analytics/usage")({
  head: () => ({ meta: [{ title: "Usage — Columbus AI" }] }),
  component: UsagePage,
});

const TOOLTIP = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

const METRICS = [
  { key: "compute", label: "Compute hours", color: "var(--color-chart-1)", fmt: (n: number) => `${n}h` },
  { key: "workflows", label: "Workflow executions", color: "var(--color-chart-2)", fmt: (n: number) => n.toLocaleString() },
  { key: "aiTokens", label: "AI tokens", color: "var(--color-chart-3)", fmt: (n: number) => `${(n / 1000).toFixed(1)}k` },
  { key: "traffic", label: "Website traffic", color: "var(--color-chart-4)", fmt: (n: number) => n.toLocaleString() },
  { key: "apiRequests", label: "API requests", color: "var(--color-chart-5)", fmt: (n: number) => n.toLocaleString() },
  { key: "storage", label: "Storage (GB)", color: "var(--color-chart-1)", fmt: (n: number) => `${n} GB` },
  { key: "dbSize", label: "Database size (GB)", color: "var(--color-chart-2)", fmt: (n: number) => `${n} GB` },
] as const;

function UsagePage() {
  const [range, setRange] = useState<Range>("30d");
  const data = useMemo(() => usageFor(range), [range]);

  const totals = METRICS.reduce<Record<string, number>>((acc, m) => {
    acc[m.key] = data.reduce((s, p) => s + (p as never)[m.key], 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Usage"
          subtitle="Unified consumption across compute, automations, AI, traffic, and storage."
        />
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
            <TabsTrigger value="90d">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.slice(0, 4).map((m) => (
          <div key={m.key} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</div>
            <div className="mt-1 font-mono text-xl font-semibold">{m.fmt(totals[m.key])}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {METRICS.map((m, i) => (
          <div key={m.key} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">{m.label}</div>
              <div className="font-mono text-xs text-muted-foreground">{m.fmt(totals[m.key])}</div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer>
                {i % 3 === 0 ? (
                  <AreaChart data={data}>
                    <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="ts" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP} />
                    <Area dataKey={m.key} stroke={m.color} fill={m.color} fillOpacity={0.2} />
                  </AreaChart>
                ) : i % 3 === 1 ? (
                  <BarChart data={data}>
                    <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="ts" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP} />
                    <Bar dataKey={m.key} fill={m.color} radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="ts" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP} />
                    <Line dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
