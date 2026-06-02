import { Coins, Users, Inbox, Target, Workflow, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useQuery } from "@tanstack/react-query";
import { useSalesStats } from "@/hooks/use-sales";
import { fetchAdminConversations } from "@/lib/conversations.functions";
import { kpis as mockKpis } from "@/lib/mock/data";
import { Skeleton } from "@/components/ui/skeleton";

const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.round(50 + Math.sin(i / 3 + seed) * 18 + (i * (seed % 5)) / 2 + Math.cos(i + seed) * 6),
  }));

export function SalesKpis() {
  const { data: stats, isLoading } = useSalesStats();
  const { data: convo } = useQuery({
    queryKey: ["admin-conversations-stats"],
    queryFn: () => fetchAdminConversations(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const pipelineK = stats?.pipelineValue ?? 0;
  const liveKpis: {
    label: string;
    value: string;
    delta: number;
    data: { x: number; y: number }[];
    icon: LucideIcon;
  }[] = [
    {
      label: "Pipeline value",
      value: `$${(pipelineK / 1000).toFixed(0)}k`,
      delta: 0,
      data: spark(1),
      icon: Coins,
    },
    {
      label: "Active sales clients",
      value: String(stats?.activeClients ?? 0),
      delta: 0,
      data: spark(2),
      icon: Users,
    },
    {
      label: "Open leads",
      value: String(stats?.openLeads ?? 0),
      delta: 0,
      data: spark(3),
      icon: Inbox,
    },
    {
      label: "Active opportunities",
      value: String(stats?.activeOpportunities ?? 0),
      delta: 0,
      data: spark(4),
      icon: Target,
    },
    { ...mockKpis[3], icon: Workflow },
    {
      label: "AI conversations today",
      value: String(convo?.totalToday ?? 0),
      delta: 0,
      data: spark(5),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {liveKpis.map((k) => (
        <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} data={k.data} icon={k.icon} />
      ))}
    </div>
  );
}
