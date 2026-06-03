import type { SalesClient, SalesLead, SalesOpportunity } from "@columbusai/db";
import type { LeadDto, OpportunityDto, PipelineCardDto, SalesClientDto } from "./dto.js";

/** Derive a 0–100 score from stored confidence or heuristics */
export function leadScore(lead: SalesLead): number {
  if (lead.confidence != null) return Math.min(100, Math.max(0, lead.confidence));
  let score = 50;
  if (lead.budget) score += 10;
  if (lead.timeline) score += 8;
  if (lead.teamSize) score += 5;
  if (lead.industry) score += 5;
  return Math.min(95, score);
}

export function estimateLeadValue(lead: SalesLead): number {
  const budget = lead.budget.toLowerCase();
  if (budget.includes("100") || budget.includes("enterprise")) return 120_000;
  if (budget.includes("50") || budget.includes("75")) return 72_000;
  if (budget.includes("25")) return 48_000;
  if (budget.includes("10")) return 24_000;
  return 18_000;
}

export function pipelineStageForLead(lead: SalesLead, opportunity?: SalesOpportunity | null): string {
  if (opportunity) return opportunity.stage;
  if (lead.status === "converted_to_opportunity") return "qualified";
  if (lead.status === "disqualified") return "lost";
  if (lead.status === "qualified") return "qualified";
  return "new";
}

export function serializeLead(lead: SalesLead, opportunity?: SalesOpportunity | null): LeadDto {
  const contactName = `${lead.fname} ${lead.lname}`.trim();
  return {
    id: lead.id,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    company: lead.company || "—",
    contact: contactName,
    contactName,
    email: lead.email,
    phone: lead.phone,
    service: lead.whatAutomate,
    industry: lead.industry,
    teamSize: lead.teamSize,
    budget: lead.budget,
    timeline: lead.timeline,
    website: lead.website,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    summary: lead.summary,
    priority: lead.priority,
    confidence: lead.confidence,
    recommendedNextStep: lead.recommendedNextStep,
    followupCount: lead.followupCount,
    lastFollowupAt: lead.lastFollowupAt?.toISOString() ?? null,
    nextFollowupAt: lead.nextFollowupAt?.toISOString() ?? null,
    followupTemplate: lead.followupTemplate,
    opportunityId: opportunity?.id ?? null,
    pipelineStage: pipelineStageForLead(lead, opportunity),
    score: leadScore(lead),
    value: opportunity?.estimatedValue ?? estimateLeadValue(lead),
  };
}

export function serializeOpportunity(
  opp: SalesOpportunity & {
    lead?: SalesLead | null;
    client?: { id: string } | null;
  },
): OpportunityDto {
  const lead = opp.lead;
  const contactName = opp.contactName;
  return {
    id: opp.id,
    leadId: opp.leadId,
    createdAt: opp.createdAt.toISOString(),
    updatedAt: opp.updatedAt.toISOString(),
    stage: opp.stage,
    title: opp.title,
    company: opp.company,
    contact: contactName,
    contactName,
    email: opp.email,
    estimatedValue: opp.estimatedValue,
    closeDate: opp.closeDate ? opp.closeDate.toISOString().slice(0, 10) : null,
    owner: opp.owner,
    notes: opp.notes,
    clientId: opp.client?.id ?? null,
    service: lead?.whatAutomate ?? opp.title,
    score: lead ? leadScore(lead) : 70,
    value: opp.estimatedValue ?? (lead ? estimateLeadValue(lead) : 0),
  };
}

export function serializeSalesClient(
  client: SalesClient & { opportunity?: (SalesOpportunity & { lead?: SalesLead | null }) | null },
): SalesClientDto {
  const opp = client.opportunity;
  const lead = opp?.lead;
  return {
    id: client.id,
    opportunityId: client.opportunityId,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    name: client.name,
    status: client.status,
    owner: client.owner,
    email: client.email,
    company: client.company,
    notes: client.notes,
    industry: lead?.industry ?? "",
    monthlyValue: opp?.estimatedValue ?? 0,
    portalClientId: client.portalClientId ?? null,
    onboardingWorkItemId: client.onboardingWorkItemId ?? null,
    stackTemplateId: client.stackTemplateId ?? null,
    provisioningStatus: client.provisioningStatus,
    provisioningError: client.provisioningError ?? null,
  };
}

export function toPipelineCard(
  entity: LeadDto | OpportunityDto,
  entityType: "lead" | "opportunity",
): PipelineCardDto {
  return {
    id: entity.id,
    entityType,
    company: entity.company,
    contact: entity.contact,
    service: entity.service,
    score: entity.score,
    value: entity.value,
    pipelineStage: entityType === "lead" ? (entity as LeadDto).pipelineStage : (entity as OpportunityDto).stage,
  };
}
