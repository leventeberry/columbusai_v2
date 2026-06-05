import { useMemo } from "react";
import { useSalesLeads, useSalesStats } from "@/hooks/use-sales";
import { useRecentActivity } from "@/hooks/use-lead-activity";
import {
  buildAttentionLeads,
  buildDashboardActivity,
  buildDashboardKpis,
  buildDashboardTasks,
} from "@/lib/dashboard/adapters";
import { formatDashboardError } from "@/lib/dashboard/error-message";

export function useDashboardOperations() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
  } = useSalesStats();
  const {
    data: leads,
    isLoading: leadsLoading,
    isError: leadsError,
    error: leadsErr,
  } = useSalesLeads();
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

  const errorMessage = useMemo(() => {
    if (!statsError && !leadsError) return undefined;
    return formatDashboardError(leadsErr ?? statsErr);
  }, [statsError, leadsError, statsErr, leadsErr]);

  return {
    kpis,
    attentionLeads,
    tasks,
    activity,
    isLoading: statsLoading || leadsLoading,
    isError: statsError || leadsError,
    errorMessage,
  };
}
