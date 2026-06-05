import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LeadPipeline } from "@/components/dashboard/lead-pipeline";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { LeadDetailSheet } from "@/components/dashboard/lead-detail-sheet";
import { PageHeader, Section } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type LeadsSearch = {
  leadId?: string;
};

export const Route = createFileRoute("/_app/sales/leads")({
  validateSearch: (s: Record<string, unknown>): LeadsSearch => ({
    leadId: typeof s.leadId === "string" && s.leadId.length > 0 ? s.leadId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Leads — Columbus AI" },
      { name: "description", content: "Manage leads and follow-up through the pipeline." },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const openLead = (leadId: string) => {
    void navigate({ search: (prev) => ({ ...prev, leadId }) });
  };

  const closePanel = (open: boolean) => {
    if (!open) {
      void navigate({ search: (prev) => ({ ...prev, leadId: undefined }) });
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Drag leads across stages or open a card to review details."
        actions={
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" /> New lead
          </Button>
        }
      />
      <LeadPipeline onSelectLead={openLead} />
      <Section title="All leads" subtitle="Filter and open any lead without leaving the pipeline.">
        <LeadsTable onOpenLead={openLead} />
      </Section>
      <LeadDetailSheet leadId={search.leadId} open={Boolean(search.leadId)} onOpenChange={closePanel} />
    </div>
  );
}
