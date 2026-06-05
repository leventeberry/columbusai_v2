import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLeadActivity,
  fetchRecentActivity,
  updateLeadNotes,
  updateLeadStatus,
  type LeadActivityDto,
} from "@/lib/sales.functions";
import { salesKeys } from "@/hooks/use-sales";

export const activityKeys = {
  all: ["activity"] as const,
  lead: (id: string) => [...activityKeys.all, "lead", id] as const,
  recent: () => [...activityKeys.all, "recent"] as const,
};

export function useLeadActivity(leadId: string) {
  return useQuery<LeadActivityDto[]>({
    queryKey: activityKeys.lead(leadId),
    queryFn: () => fetchLeadActivity({ data: { id: leadId } }),
    enabled: Boolean(leadId),
  });
}

export function useRecentActivity() {
  return useQuery<LeadActivityDto[]>({
    queryKey: activityKeys.recent(),
    queryFn: () => fetchRecentActivity(),
  });
}

export function useUpdateLeadNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; notes: string }) =>
      updateLeadNotes({ data: vars }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: salesKeys.lead(vars.id) });
      void qc.invalidateQueries({ queryKey: activityKeys.lead(vars.id) });
      void qc.invalidateQueries({ queryKey: activityKeys.recent() });
    },
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      updateLeadStatus({ data: vars }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: salesKeys.all });
      void qc.invalidateQueries({ queryKey: activityKeys.lead(vars.id) });
      void qc.invalidateQueries({ queryKey: activityKeys.recent() });
    },
  });
}
