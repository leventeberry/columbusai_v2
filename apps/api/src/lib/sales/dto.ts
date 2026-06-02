import type {
  SalesClientStatus,
  SalesLeadStatus,
  SalesOpportunityStage,
} from "@columbusai/db";

export type LeadDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  contact: string;
  contactName: string;
  email: string;
  phone: string;
  service: string;
  industry: string;
  teamSize: string;
  budget: string;
  timeline: string;
  website: string;
  status: SalesLeadStatus;
  source: string;
  notes: string | null;
  summary: string | null;
  priority: string | null;
  confidence: number | null;
  recommendedNextStep: string | null;
  opportunityId: string | null;
  /** Kanban column: lead status or linked opportunity stage */
  pipelineStage: string;
  score: number;
  value: number;
};

export type OpportunityDto = {
  id: string;
  leadId: string;
  createdAt: string;
  updatedAt: string;
  stage: SalesOpportunityStage;
  title: string;
  company: string;
  contact: string;
  contactName: string;
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

export type SalesClientDto = {
  id: string;
  opportunityId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: SalesClientStatus;
  owner: string | null;
  email: string;
  company: string;
  notes: string | null;
  industry: string;
  monthlyValue: number;
};

export type PipelineCardDto = {
  id: string;
  entityType: "lead" | "opportunity";
  company: string;
  contact: string;
  service: string;
  score: number;
  value: number;
  pipelineStage: string;
};

export type SalesStatsDto = {
  openLeads: number;
  activeOpportunities: number;
  activeClients: number;
  pipelineValue: number;
  wonThisMonth: number;
  leadsByStatus: Record<string, number>;
  opportunitiesByStage: Record<string, number>;
};
