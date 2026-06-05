import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { manualLeadSchema } from "@columbusai/leads/validation";
import { assertAdminRole, requireApiSession } from "@/lib/auth-middleware";
import { salesApiFetch } from "@/lib/sales-api.server";
import type {
  PipelineCard,
  SalesLead,
  SalesOpportunity,
  SalesPipelineClient,
  SalesStats,
  ConvertClientResult,
  StackTemplate,
} from "@/lib/sales-types";

export type LeadActivityDto = {
  id: string;
  createdAt: string;
  leadId: string;
  type: string;
  title: string;
  detail: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
};

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => manualLeadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ lead: SalesLead }>("/api/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.lead;
  });

export const updateLeadNotes = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), notes: z.string() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ lead: SalesLead }>(`/api/leads/${data.id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes: data.notes }),
    });
    return res.lead;
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), status: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ lead: SalesLead }>(`/api/leads/${data.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: data.status }),
    });
    return res.lead;
  });

export const fetchLeadActivity = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ activity: LeadActivityDto[] }>(
      `/api/leads/${data.id}/activity`,
    );
    return res.activity;
  });

export const fetchRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ activity: LeadActivityDto[] }>("/api/activity/recent");
    return data.activity;
  });

export const fetchSalesPipeline = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ cards: PipelineCard[] }>("/api/leads/pipeline");
    return data.cards;
  });

export const fetchSalesLeads = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ leads: SalesLead[] }>("/api/leads");
    return data.leads;
  });

export const fetchSalesLead = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ lead: SalesLead }>(`/api/leads/${data.id}`);
    return res.lead;
  });

export const updateLeadPipelineStage = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), pipelineStage: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ lead?: SalesLead; opportunity?: SalesOpportunity }>(
      `/api/leads/${data.id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ pipelineStage: data.pipelineStage }),
      },
    );
    return res.lead ?? res.opportunity!;
  });

export const convertLeadToOpportunity = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ opportunity: SalesOpportunity }>(
      `/api/leads/${data.id}/convert-to-opportunity`,
      { method: "POST", body: "{}" },
    );
    return res.opportunity;
  });

export const fetchSalesOpportunities = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ opportunities: SalesOpportunity[] }>("/api/opportunities");
    return data.opportunities;
  });

export const fetchSalesOpportunity = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ opportunity: SalesOpportunity }>(
      `/api/opportunities/${data.id}`,
    );
    return res.opportunity;
  });

export const fetchSalesClients = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ clients: SalesPipelineClient[] }>("/api/clients");
    return data.clients;
  });

export const fetchSalesClient = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ client: SalesPipelineClient }>(`/api/clients/${data.id}`);
    return res.client;
  });

export const updateOpportunityStage = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        stage: z.enum(["qualified", "proposal", "negotiation", "won", "lost"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    const res = await salesApiFetch<{ opportunity: SalesOpportunity }>(
      `/api/opportunities/${data.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ stage: data.stage }),
      },
    );
    return res.opportunity;
  });

export const convertOpportunityToClient = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        stackTemplateId: z.string().min(1).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    return salesApiFetch<ConvertClientResult>(
      `/api/opportunities/${data.id}/convert-to-client`,
      {
        method: "POST",
        body: JSON.stringify({ stackTemplateId: data.stackTemplateId }),
      },
    );
  });

export const retrySalesClientProvision = createServerFn({ method: "POST" })
  .middleware([requireApiSession])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        stackTemplateId: z.string().min(1).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.roles);
    return salesApiFetch<ConvertClientResult>(`/api/clients/${data.id}/retry-provision`, {
      method: "POST",
      body: JSON.stringify({ stackTemplateId: data.stackTemplateId }),
    });
  });

export const fetchStackTemplates = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ templates: StackTemplate[] }>(
      "/api/onboarding/stack-templates",
    );
    return data.templates;
  });

export const fetchSalesStats = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ stats: SalesStats }>("/api/sales/stats");
    return data.stats;
  });
