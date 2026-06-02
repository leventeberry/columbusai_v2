import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvertLead, useSalesLead } from "@/hooks/use-sales";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/sales/leads/$leadId")({
  head: ({ params }) => ({
    meta: [{ title: `Lead ${params.leadId.slice(0, 8)}… — Columbus AI` }],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const { data: lead, isLoading, isError } = useSalesLead(leadId);
  const convert = useConvertLead();

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead?.company ?? "Lead"}
        subtitle={lead ? `${lead.contact} · ${lead.email}` : "Loading…"}
        actions={
          lead && !lead.opportunityId ? (
            <Button size="sm" disabled={convert.isPending} onClick={() => convert.mutate(lead.id)}>
              Convert to opportunity
            </Button>
          ) : null
        }
      />
      {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}
      {isError && <p className="text-sm text-destructive">Lead not found or API error.</p>}
      {lead && (
        <div className="grid gap-4 rounded-xl border border-border/60 bg-card/40 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Status</h3>
            <Badge className="mt-1 capitalize">{lead.status.replace(/_/g, " ")}</Badge>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Pipeline stage</h3>
            <p className="mt-1 capitalize">{lead.pipelineStage}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Service interest
            </h3>
            <p className="mt-1">{lead.service}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Score / value</h3>
            <p className="mt-1 font-mono">
              {lead.score} · ${lead.value.toLocaleString()}
            </p>
          </div>
          {lead.summary && (
            <div className="md:col-span-2">
              <h3 className="text-xs font-medium uppercase text-muted-foreground">Summary</h3>
              <p className="mt-1 text-sm">{lead.summary}</p>
            </div>
          )}
          {lead.opportunityId && (
            <div className="md:col-span-2">
              <Link
                to="/sales/opportunities/$opportunityId"
                params={{ opportunityId: lead.opportunityId }}
                className="text-sm text-primary hover:underline"
              >
                View linked opportunity →
              </Link>
            </div>
          )}
          <div className="md:col-span-2 text-xs text-muted-foreground">
            Created {new Date(lead.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
