import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSalesOpportunity } from "@/hooks/use-sales";
import { ConvertClientDialog } from "@/components/dashboard/convert-client-dialog";

export const Route = createFileRoute("/_app/sales/opportunities/$opportunityId")({
  head: ({ params }) => ({
    meta: [{ title: `Opportunity — Columbus AI` }],
  }),
  component: OpportunityDetailPage,
});

function OpportunityDetailPage() {
  const { opportunityId } = Route.useParams();
  const { data: opp, isLoading, isError, refetch } = useSalesOpportunity(opportunityId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={opp?.title ?? "Opportunity"}
        subtitle={opp ? `${opp.company} · ${opp.contact}` : "Loading…"}
      />
      {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}
      {isError && <p className="text-sm text-destructive">Opportunity not found or API error.</p>}
      {opp && (
        <div className="grid gap-4 rounded-xl border border-border/60 bg-card/40 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Stage</h3>
            <Badge className="mt-1 capitalize">{opp.stage}</Badge>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Estimated value</h3>
            <p className="mt-1 font-mono">${(opp.value ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Email</h3>
            <p className="mt-1">{opp.email}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Owner</h3>
            <p className="mt-1">{opp.owner ?? "—"}</p>
          </div>
          {opp.notes && (
            <div className="md:col-span-2">
              <h3 className="text-xs font-medium uppercase text-muted-foreground">Notes</h3>
              <p className="mt-1 text-sm">{opp.notes}</p>
            </div>
          )}
          <div className="md:col-span-2 flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/sales/leads/$leadId"
              params={{ leadId: opp.leadId }}
              className="text-primary hover:underline"
            >
              ← Source lead
            </Link>
            {opp.clientId ? (
              <Link
                to="/sales/clients/$salesClientId"
                params={{ salesClientId: opp.clientId }}
                className="text-primary hover:underline"
              >
                View client →
              </Link>
            ) : (
              <ConvertClientDialog
                opportunityId={opp.id}
                company={opp.company}
                onConverted={() => void refetch()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
