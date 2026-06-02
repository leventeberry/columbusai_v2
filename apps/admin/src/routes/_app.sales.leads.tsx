import { createFileRoute } from "@tanstack/react-router";
import { LeadPipeline } from "@/components/dashboard/lead-pipeline";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/sales/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Columbus AI" },
      { name: "description", content: "Drag-and-drop lead pipeline across stages." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Drag leads across stages to move them through the pipeline."
        actions={
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" /> New lead
          </Button>
        }
      />
      <LeadPipeline />
    </div>
  ),
});
