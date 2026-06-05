import { useMemo } from "react";
import { useSalesLeads, useSalesStats } from "@/hooks/use-sales";
import { useRecentActivity } from "@/hooks/use-lead-activity";
import {
  buildAttentionLeads,
  buildDashboardActivity,
  buildDashboardKpis,
  buildDashboardTasks,
} from "@/lib/dashboard/adapters";

export function useDashboardOperations() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useSalesStats();
  const { data: leads, isLoading: leadsLoading, isError: leadsError } = useSalesLeads();
  const { data: recentActivity } = useRecentActivity();

  const leadList = leads ?? [];

  const attentionLeads = useMemo(() => buildAttentionLeads(leadList), [leadList]);
  const tasks = useMemo(() => buildDashboardTasks(leadList), [leadList]);
  const activity = useMemo(
    () => buildDashboardActivity(recentActivity, leadList),
    [recentActivity, leadList],
  );
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
    isError: statsError || leadsError,
  };
}
