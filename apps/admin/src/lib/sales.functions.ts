import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdminRole, requireApiSession } from "@/lib/auth-middleware";
import { salesApiFetch } from "@/lib/sales-api.server";
import type {
  PipelineCard,
  SalesLead,
  SalesOpportunity,
  SalesPipelineClient,
  SalesStats,
} from "@/lib/sales-types";

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

export const fetchSalesStats = createServerFn({ method: "GET" })
  .middleware([requireApiSession])
  .handler(async ({ context }) => {
    await assertAdminRole(context.roles);
    const data = await salesApiFetch<{ stats: SalesStats }>("/api/sales/stats");
    return data.stats;
  });
