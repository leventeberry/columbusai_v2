import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import { LeadsAttentionQueue } from "@/components/dashboard/leads-attention-queue";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { PageHeader, Section } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Columbus AI" },
      {
        name: "description",
        content: "Operational overview — what requires your attention right now.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations overview"
        subtitle="What needs your attention right now."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/sales/leads">View leads</Link>
          </Button>
        }
      />

      <DashboardKpis />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Leads requiring attention"
          subtitle="Follow-ups due, new inquiries, and leads needing review."
        >
          <LeadsAttentionQueue />
        </Section>

        <Section title="Today's tasks" subtitle="Due today and overdue across your business.">
          <TodaysTasks />
        </Section>
      </div>

      <Section title="Recent activity" subtitle="Latest changes across leads, clients, and workflows.">
        <RecentActivityFeed />
      </Section>
    </div>
  );
}
