import {
  Prisma,
  type SalesLeadStatus,
  type SalesOpportunityStage,
} from "@columbusai/db";
import { resolveLeadFollowupInit } from "@columbusai/leads";
import { prisma } from "../prisma.js";
import type { LeadDto, OpportunityDto, PipelineCardDto, SalesClientDto, SalesStatsDto, ConvertClientResultDto } from "./dto.js";
import {
  estimateLeadValue,
  serializeLead,
  serializeOpportunity,
  serializeSalesClient,
  toPipelineCard,
} from "./serialize.js";
import {
  provisionClientFromOpportunity,
  retryProvisionSalesClient,
  type ProvisionOptions,
} from "../onboarding/provisionClient.js";

export type { ProvisionOptions };

export type DemoLeadInput = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
  what_automate: string;
  budget: string;
  timeline: string;
  website: string;
  created_at: string;
};

export async function createDemoLead(input: DemoLeadInput) {
  const followup = resolveLeadFollowupInit(new Date(input.created_at));
  const created = await prisma.salesLead.create({
    data: {
      id: input.id,
      createdAt: new Date(input.created_at),
      fname: input.fname,
      lname: input.lname,
      email: input.email,
      phone: input.phone,
      company: input.company,
      role: input.role,
      industry: input.industry,
      teamSize: input.team_size,
      whatAutomate: input.what_automate,
      budget: input.budget,
      timeline: input.timeline,
      website: input.website,
      status: "new",
      source: "demo_request",
      followupCount: 0,
      followupTemplate: followup.followupTemplate,
      nextFollowupAt: followup.nextFollowupAt,
    },
    include: { opportunity: true },
  });
  return serializeLead(created, created.opportunity);
}

export async function listLeads(): Promise<LeadDto[]> {
  const rows = await prisma.salesLead.findMany({
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => serializeLead(r, r.opportunity));
}

export async function getLeadById(id: string): Promise<LeadDto | null> {
  const row = await prisma.salesLead.findUnique({
    where: { id },
    include: { opportunity: true },
  });
  return row ? serializeLead(row, row.opportunity) : null;
}

const LEAD_STATUS_TO_PIPELINE: Record<SalesLeadStatus, string> = {
  new: "new",
  qualified: "qualified",
  disqualified: "lost",
  converted_to_opportunity: "qualified",
};

const PIPELINE_TO_LEAD_STATUS: Record<string, SalesLeadStatus> = {
  new: "new",
  qualified: "qualified",
  lost: "disqualified",
};

const PIPELINE_TO_OPP_STAGE: Record<string, SalesOpportunityStage> = {
  proposal: "proposal",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
  qualified: "qualified",
};

export async function updateLeadPipelineStage(
  id: string,
  pipelineStage: string,
): Promise<LeadDto | OpportunityDto | null> {
  const lead = await prisma.salesLead.findUnique({
    where: { id },
    include: { opportunity: true },
  });
  if (!lead) return null;

  const oppStages = ["proposal", "negotiation", "won", "lost"];
  if (oppStages.includes(pipelineStage) || (pipelineStage === "qualified" && lead.opportunity)) {
    if (!lead.opportunity) {
      return convertLeadToOpportunity(id, {
        stage: PIPELINE_TO_OPP_STAGE[pipelineStage] ?? "qualified",
      });
    }
    const updated = await prisma.salesOpportunity.update({
      where: { id: lead.opportunity.id },
      data: { stage: PIPELINE_TO_OPP_STAGE[pipelineStage] ?? lead.opportunity.stage },
      include: { lead: true, client: true },
    });
    if (pipelineStage === "won" && !updated.client) {
      await convertOpportunityToClient(updated.id);
      const refreshed = await getOpportunityById(updated.id);
      return refreshed ?? serializeOpportunity(updated);
    }
    return serializeOpportunity(updated);
  }

  const status = PIPELINE_TO_LEAD_STATUS[pipelineStage] ?? "new";
  const updated = await prisma.salesLead.update({
    where: { id },
    data: { status },
    include: { opportunity: true },
  });
  return serializeLead(updated, updated.opportunity);
}

export async function updateLeadStatus(id: string, status: SalesLeadStatus): Promise<LeadDto | null> {
  try {
    const updated = await prisma.salesLead.update({
      where: { id },
      data: { status },
      include: { opportunity: true },
    });
    return serializeLead(updated, updated.opportunity);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function convertLeadToOpportunity(
  leadId: string,
  opts?: { stage?: SalesOpportunityStage; estimatedValue?: number },
): Promise<OpportunityDto | null> {
  const lead = await prisma.salesLead.findUnique({ where: { id: leadId } });
  if (!lead) return null;

  const existing = await prisma.salesOpportunity.findUnique({ where: { leadId } });
  if (existing) {
    const full = await prisma.salesOpportunity.findUniqueOrThrow({
      where: { id: existing.id },
      include: { lead: true, client: true },
    });
    return serializeOpportunity(full);
  }

  const contactName = `${lead.fname} ${lead.lname}`.trim();
  const title = lead.company ? `${lead.company} — ${lead.whatAutomate}` : lead.whatAutomate;

  const result = await prisma.$transaction(async (tx) => {
    const opp = await tx.salesOpportunity.create({
      data: {
        leadId: lead.id,
        stage: opts?.stage ?? "qualified",
        title,
        company: lead.company || contactName,
        contactName,
        email: lead.email,
        estimatedValue: opts?.estimatedValue ?? estimateLeadValue(lead),
        notes: lead.notes,
      },
      include: { lead: true },
    });
    await tx.salesLead.update({
      where: { id: lead.id },
      data: { status: "converted_to_opportunity" },
    });
    return opp;
  });

  return serializeOpportunity(result);
}

export async function listOpportunities(): Promise<OpportunityDto[]> {
  const rows = await prisma.salesOpportunity.findMany({
    include: { lead: true, client: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeOpportunity);
}

export async function getOpportunityById(id: string): Promise<OpportunityDto | null> {
  const row = await prisma.salesOpportunity.findUnique({
    where: { id },
    include: { lead: true, client: true },
  });
  return row ? serializeOpportunity(row) : null;
}

export async function updateOpportunity(
  id: string,
  data: Partial<{
    stage: SalesOpportunityStage;
    title: string;
    estimatedValue: number;
    closeDate: string;
    owner: string;
    notes: string;
  }>,
): Promise<OpportunityDto | null> {
  try {
    const updated = await prisma.salesOpportunity.update({
      where: { id },
      data: {
        ...(data.stage && { stage: data.stage }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.estimatedValue !== undefined && { estimatedValue: data.estimatedValue }),
        ...(data.closeDate !== undefined && {
          closeDate: data.closeDate ? new Date(data.closeDate) : null,
        }),
        ...(data.owner !== undefined && { owner: data.owner }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { lead: true, client: true },
    });
    if (data.stage === "won" && !updated.client) {
      await convertOpportunityToClient(updated.id);
      return getOpportunityById(id);
    }
    return serializeOpportunity(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function convertOpportunityToClient(
  opportunityId: string,
  opts: ProvisionOptions = {},
): Promise<ConvertClientResultDto | null> {
  const result = await provisionClientFromOpportunity(opportunityId, opts);
  if (!result) return null;
  return {
    client: result.client,
    portalClientId: result.portalClientId,
    onboardingWorkItemId: result.onboardingWorkItemId,
    clientUserId: result.clientUserId,
    tempPassword: result.tempPassword,
    alreadyProvisioned: result.alreadyProvisioned,
  };
}

export async function retrySalesClientProvision(
  salesClientId: string,
  opts: ProvisionOptions = {},
): Promise<ConvertClientResultDto | null> {
  const result = await retryProvisionSalesClient(salesClientId, opts);
  if (!result) return null;
  return {
    client: result.client,
    portalClientId: result.portalClientId,
    onboardingWorkItemId: result.onboardingWorkItemId,
    clientUserId: result.clientUserId,
    tempPassword: result.tempPassword,
    alreadyProvisioned: result.alreadyProvisioned,
  };
}

export async function listSalesClients(): Promise<SalesClientDto[]> {
  const rows = await prisma.salesClient.findMany({
    include: { opportunity: { include: { lead: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeSalesClient);
}

export async function getSalesClientById(id: string): Promise<SalesClientDto | null> {
  const row = await prisma.salesClient.findUnique({
    where: { id },
    include: { opportunity: { include: { lead: true } } },
  });
  return row ? serializeSalesClient(row) : null;
}

export async function getPipelineBoard(): Promise<PipelineCardDto[]> {
  const leads = await listLeads();
  const opps = await listOpportunities();
  const cards: PipelineCardDto[] = [];

  for (const lead of leads) {
    if (lead.status === "converted_to_opportunity" && lead.opportunityId) continue;
    cards.push(toPipelineCard(lead, "lead"));
  }
  for (const opp of opps) {
    if (opp.stage === "won" && opp.clientId) continue;
    cards.push(toPipelineCard(opp, "opportunity"));
  }
  return cards;
}

export async function getSalesStats(): Promise<SalesStatsDto> {
  const [leadCounts, oppCounts, clientCount, pipelineSum] = await Promise.all([
    prisma.salesLead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.salesOpportunity.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.salesClient.count({ where: { status: { in: ["active", "onboarding"] } } }),
    prisma.salesOpportunity.aggregate({
      where: { stage: { notIn: ["won", "lost"] } },
      _sum: { estimatedValue: true },
    }),
  ]);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const wonThisMonth = await prisma.salesOpportunity.count({
    where: { stage: "won", updatedAt: { gte: monthStart } },
  });

  const leadsByStatus: Record<string, number> = {};
  for (const row of leadCounts) leadsByStatus[row.status] = row._count._all;

  const opportunitiesByStage: Record<string, number> = {};
  for (const row of oppCounts) opportunitiesByStage[row.stage] = row._count._all;

  const openLeads =
    (leadsByStatus.new ?? 0) + (leadsByStatus.qualified ?? 0);

  const activeOpportunities = Object.entries(opportunitiesByStage)
    .filter(([s]) => s !== "won" && s !== "lost")
    .reduce((sum, [, n]) => sum + n, 0);

  return {
    openLeads,
    activeOpportunities,
    activeClients: clientCount,
    pipelineValue: pipelineSum._sum.estimatedValue ?? 0,
    wonThisMonth,
    leadsByStatus,
    opportunitiesByStage,
  };
}
