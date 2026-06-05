import { Inbox, Users, CheckSquare, MessageSquare, Coins } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardDataError } from "@/components/dashboard/dashboard-data-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOperations } from "@/hooks/use-dashboard";

export function DashboardKpis() {
  const { kpis, isLoading, isError } = useDashboardOperations();

  if (isError) {
    return <DashboardDataError />;
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "New Leads", value: String(kpis.newLeads.value), icon: Inbox },
    { label: "Active Clients", value: String(kpis.activeClients.value), icon: Users },
    { label: "Tasks Due Today", value: String(kpis.tasksDueToday.value), icon: CheckSquare },
    { label: "Unread Messages", value: String(kpis.unreadMessages.value), icon: MessageSquare },
    {
      label: "Pipeline Value",
      value: `$${(kpis.pipelineValue.value / 1000).toFixed(0)}k`,
      icon: Coins,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((k) => (
        <KpiCard
          key={k.label}
          label={k.label}
          value={k.value}
          delta={0}
          data={[]}
          icon={k.icon}
          showTrend={false}
        />
      ))}
    </div>
  );
}
