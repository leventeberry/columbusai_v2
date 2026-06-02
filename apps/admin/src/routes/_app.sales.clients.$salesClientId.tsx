import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesClient } from "@/hooks/use-sales";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/sales/clients/$salesClientId")({
  head: () => ({ meta: [{ title: "Sales client — Columbus AI" }] }),
  component: SalesClientDetailPage,
});

function SalesClientDetailPage() {
  const { salesClientId } = Route.useParams();
  const { data: client, isLoading, isError } = useSalesClient(salesClientId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={client?.name ?? "Client"}
        subtitle={client ? `${client.company} · ${client.email}` : "Loading…"}
      />
      {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}
      {isError && <p className="text-sm text-destructive">Client not found or API error.</p>}
      {client && (
        <div className="grid gap-4 rounded-xl border border-border/60 bg-card/40 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Status</h3>
            <Badge className="mt-1 capitalize">{client.status}</Badge>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Monthly value</h3>
            <p className="mt-1 font-mono">${client.monthlyValue.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Owner</h3>
            <p className="mt-1">{client.owner ?? "—"}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Industry</h3>
            <p className="mt-1">{client.industry || "—"}</p>
          </div>
          <div className="md:col-span-2">
            <Link
              to="/sales/opportunities/$opportunityId"
              params={{ opportunityId: client.opportunityId }}
              className="text-sm text-primary hover:underline"
            >
              View source opportunity →
            </Link>
          </div>
          <p className="md:col-span-2 text-xs text-muted-foreground">
            Operations workspace (projects, deliverables) uses{" "}
            <Link to="/clients" className="text-primary hover:underline">
              /clients
            </Link>{" "}
            — separate from this sales CRM record.
          </p>
        </div>
      )}
    </div>
  );
}
