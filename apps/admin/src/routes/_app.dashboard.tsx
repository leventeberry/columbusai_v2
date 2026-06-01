import { createFileRoute } from "@tanstack/react-router";
import {
  Coins,
  Users,
  Inbox,
  Workflow,
  MessageSquare,
  Percent,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LeadPipeline } from "@/components/dashboard/lead-pipeline";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { WorkflowMonitoring } from "@/components/dashboard/workflow-monitoring";
import { AgentControl } from "@/components/dashboard/agent-control";
import { SystemHealth } from "@/components/dashboard/system-health";
import { PageHeader, Section } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { kpis } from "@/lib/mock/data";

const ICONS = [Coins, Users, Inbox, Workflow, MessageSquare, Percent];

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Columbus AI" },
      { name: "description", content: "Executive overview of revenue, clients, leads, and AI automations." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive overview"
        subtitle="Real-time pulse on revenue, clients, and AI operations."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground">
              New workflow
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} {...k} icon={ICONS[i]} />
        ))}
      </div>

      <Section title="Lead pipeline" subtitle="Drag cards across stages to update.">
        <LeadPipeline />
      </Section>

      <Section title="Active clients" subtitle="147 paying clients · sorted by recent activity.">
        <ClientsTable />
      </Section>

      <Section title="Workflow monitoring" subtitle="Live execution status across all environments.">
        <WorkflowMonitoring />
      </Section>

      <Section title="AI agent control center" subtitle="Manage your fleet of production AI agents.">
        <AgentControl />
      </Section>

      <Section title="System health" subtitle="Infrastructure pulse across services and providers.">
        <SystemHealth />
      </Section>
    </div>
  );
}
