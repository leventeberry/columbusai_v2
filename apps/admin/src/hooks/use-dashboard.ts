import { useMemo } from "react";
import { useSalesLeads, useSalesStats } from "@/hooks/use-sales";
import {
  buildAttentionLeads,
  buildDashboardActivity,
  buildDashboardKpis,
  buildDashboardTasks,
} from "@/lib/dashboard/adapters";

export function useDashboardOperations() {
  const { data: stats, isLoading: statsLoading } = useSalesStats();
  const { data: leads, isLoading: leadsLoading } = useSalesLeads();

  const leadList = leads ?? [];

  const attentionLeads = useMemo(() => buildAttentionLeads(leadList), [leadList]);
  const tasks = useMemo(() => buildDashboardTasks(leadList), [leadList]);
  const activity = useMemo(() => buildDashboardActivity(leadList), [leadList]);
  const kpis = useMemo(
    () => buildDashboardKpis(stats, leadList, tasks),
    [stats, leadList, tasks],
  );

  return {
    kpis,
    attentionLeads,
    tasks,
    activity,
    isLoading: statsLoading || leadsLoading,
  };
}
