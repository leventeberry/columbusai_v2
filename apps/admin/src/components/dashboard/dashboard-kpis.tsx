import { Inbox, Users, CheckSquare, MessageSquare, Coins } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOperations } from "@/hooks/use-dashboard";

const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.round(50 + Math.sin(i / 3 + seed) * 18 + (i * (seed % 5)) / 2 + Math.cos(i + seed) * 6),
  }));

export function DashboardKpis() {
  const { kpis, isLoading } = useDashboardOperations();

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
    {
      label: "New Leads",
      value: String(kpis.newLeads.value),
      delta: 0,
      data: spark(1),
      icon: Inbox,
    },
    {
      label: "Active Clients",
      value: String(kpis.activeClients.value),
      delta: 0,
      data: spark(2),
      icon: Users,
    },
    {
      label: "Tasks Due Today",
      value: String(kpis.tasksDueToday.value),
      delta: 0,
      data: spark(3),
      icon: CheckSquare,
    },
    {
      label: "Unread Messages",
      value: String(kpis.unreadMessages.value),
      delta: 0,
      data: spark(4),
      icon: MessageSquare,
    },
    {
      label: "Pipeline Value",
      value: `$${(kpis.pipelineValue.value / 1000).toFixed(0)}k`,
      delta: 0,
      data: spark(5),
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
          delta={k.delta}
          data={k.data}
          icon={k.icon}
        />
      ))}
    </div>
  );
}
