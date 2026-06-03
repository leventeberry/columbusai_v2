import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertLeadToOpportunity,
  convertOpportunityToClient,
  fetchSalesClient,
  fetchSalesClients,
  fetchSalesLead,
  fetchSalesLeads,
  fetchSalesOpportunities,
  fetchSalesOpportunity,
  fetchSalesPipeline,
  fetchSalesStats,
  fetchStackTemplates,
  retrySalesClientProvision,
  updateLeadPipelineStage,
  updateOpportunityStage,
} from "@/lib/sales.functions";
import type { LeadStage } from "@/lib/sales-types";

export const salesKeys = {
  all: ["sales"] as const,
  pipeline: () => [...salesKeys.all, "pipeline"] as const,
  leads: () => [...salesKeys.all, "leads"] as const,
  lead: (id: string) => [...salesKeys.all, "lead", id] as const,
  opportunities: () => [...salesKeys.all, "opportunities"] as const,
  opportunity: (id: string) => [...salesKeys.all, "opportunity", id] as const,
  clients: () => [...salesKeys.all, "clients"] as const,
  client: (id: string) => [...salesKeys.all, "client", id] as const,
  stats: () => [...salesKeys.all, "stats"] as const,
  stackTemplates: () => [...salesKeys.all, "stack-templates"] as const,
};

export function useSalesPipeline() {
  return useQuery({
    queryKey: salesKeys.pipeline(),
    queryFn: () => fetchSalesPipeline(),
  });
}

export function useSalesLeads() {
  return useQuery({
    queryKey: salesKeys.leads(),
    queryFn: () => fetchSalesLeads(),
  });
}

export function useSalesLead(id: string) {
  return useQuery({
    queryKey: salesKeys.lead(id),
    queryFn: () => fetchSalesLead({ data: { id } }),
    enabled: Boolean(id),
  });
}

export function useSalesOpportunities() {
  return useQuery({
    queryKey: salesKeys.opportunities(),
    queryFn: () => fetchSalesOpportunities(),
  });
}

export function useSalesOpportunity(id: string) {
  return useQuery({
    queryKey: salesKeys.opportunity(id),
    queryFn: () => fetchSalesOpportunity({ data: { id } }),
    enabled: Boolean(id),
  });
}

export function useSalesClients() {
  return useQuery({
    queryKey: salesKeys.clients(),
    queryFn: () => fetchSalesClients(),
  });
}

export function useSalesClient(id: string) {
  return useQuery({
    queryKey: salesKeys.client(id),
    queryFn: () => fetchSalesClient({ data: { id } }),
    enabled: Boolean(id),
  });
}

export function useSalesStats() {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: () => fetchSalesStats(),
  });
}

export function useUpdatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      pipelineStage: LeadStage;
      entityType: "lead" | "opportunity";
    }) =>
      vars.entityType === "opportunity"
        ? updateOpportunityStage({ data: { id: vars.id, stage: vars.pipelineStage } })
        : updateLeadPipelineStage({ data: { id: vars.id, pipelineStage: vars.pipelineStage } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => convertLeadToOpportunity({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useStackTemplates() {
  return useQuery({
    queryKey: salesKeys.stackTemplates(),
    queryFn: () => fetchStackTemplates(),
  });
}

export function useConvertOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; stackTemplateId?: string }) =>
      convertOpportunityToClient({ data: vars }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useRetryProvision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; stackTemplateId?: string }) =>
      retrySalesClientProvision({ data: vars }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}
