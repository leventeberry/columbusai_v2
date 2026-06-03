/** DTOs returned by the Columbus API sales endpoints (admin-normalized). */

export type LeadStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type SalesLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  service: string;
  industry: string;
  status: string;
  notes: string | null;
  summary: string | null;
  priority: string | null;
  confidence: number | null;
  recommendedNextStep: string | null;
  followupCount: number;
  lastFollowupAt: string | null;
  nextFollowupAt: string | null;
  followupTemplate: string | null;
  opportunityId: string | null;
  pipelineStage: LeadStage | string;
  score: number;
  value: number;
};

export type SalesOpportunity = {
  id: string;
  leadId: string;
  createdAt: string;
  updatedAt: string;
  stage: LeadStage | string;
  title: string;
  company: string;
  contact: string;
  email: string;
  estimatedValue: number | null;
  closeDate: string | null;
  owner: string | null;
  notes: string | null;
  clientId: string | null;
  service: string;
  score: number;
  value: number;
};

export type SalesPipelineClient = {
  id: string;
  opportunityId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: "onboarding" | "active" | "paused" | "churned";
  owner: string | null;
  email: string;
  company: string;
  notes: string | null;
  industry: string;
  monthlyValue: number;
  portalClientId: string | null;
  onboardingWorkItemId: string | null;
  stackTemplateId: string | null;
  provisioningStatus: "pending" | "portal_ready" | "failed";
  provisioningError: string | null;
};

export type ConvertClientResult = {
  client: SalesPipelineClient;
  portalClientId: string;
  onboardingWorkItemId: string;
  clientUserId: string;
  tempPassword?: string;
  alreadyProvisioned: boolean;
};

export type StackTemplate = {
  id: string;
  name: string;
  description: string;
  services: string[];
};

export type PipelineCard = {
  id: string;
  entityType: "lead" | "opportunity";
  company: string;
  contact: string;
  service: string;
  score: number;
  value: number;
  pipelineStage: LeadStage | string;
};

export type SalesStats = {
  openLeads: number;
  activeOpportunities: number;
  activeClients: number;
  pipelineValue: number;
  wonThisMonth: number;
  leadsByStatus: Record<string, number>;
  opportunitiesByStage: Record<string, number>;
};

/** Card shape used by the Kanban UI (matches legacy mock Lead). */
export type PipelineLeadCard = {
  id: string;
  company: string;
  contact: string;
  service: string;
  score: number;
  value: number;
  stage: LeadStage;
  entityType: "lead" | "opportunity";
};

export function pipelineCardToLeadCard(card: PipelineCard): PipelineLeadCard {
  return {
    id: card.id,
    company: card.company,
    contact: card.contact,
    service: card.service,
    score: card.score,
    value: card.value,
    stage: card.pipelineStage as LeadStage,
    entityType: card.entityType,
  };
}

export function salesClientToTableRow(c: SalesPipelineClient) {
  const statusLabel =
    c.status === "active"
      ? "Active"
      : c.status === "onboarding"
        ? "Onboarding"
        : c.status === "paused"
          ? "Paused"
          : "At Risk";
  return {
    id: c.id,
    name: c.name,
    status: statusLabel as "Active" | "Onboarding" | "At Risk" | "Paused",
    automations: 0,
    lastActivity: new Date(c.updatedAt).toLocaleDateString(),
    monthlyValue: c.monthlyValue,
    health: c.status === "active" ? 90 : c.status === "onboarding" ? 72 : 60,
    industry: c.industry || "—",
    owner: c.owner ?? "—",
  };
}
