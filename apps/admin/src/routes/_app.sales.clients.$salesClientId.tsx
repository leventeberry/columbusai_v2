import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesClient, useRetryProvision, useStackTemplates } from "@/hooks/use-sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/sales/clients/$salesClientId")({
  head: () => ({ meta: [{ title: "Sales client — Columbus AI" }] }),
  component: SalesClientDetailPage,
});

function provisioningLabel(status: string) {
  if (status === "portal_ready") return "Portal ready";
  if (status === "failed") return "Provisioning failed";
  return "Pending";
}

function SalesClientDetailPage() {
  const { salesClientId } = Route.useParams();
  const { data: client, isLoading, isError, refetch } = useSalesClient(salesClientId);
  const retry = useRetryProvision();
  const { data: templates = [] } = useStackTemplates();
  const stackName =
    templates.find((t) => t.id === client?.stackTemplateId)?.name ?? client?.stackTemplateId ?? "—";

  async function handleRetry() {
    try {
      const result = await retry.mutateAsync({ id: salesClientId });
      toast.success("Portal provisioning completed");
      if (result.tempPassword) {
        toast.message("Portal login created", {
          description: `Temporary password: ${result.tempPassword}`,
          duration: 20_000,
        });
      }
      void refetch();
    } catch {
      toast.error("Retry provisioning failed");
    }
  }

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
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Provisioning</h3>
            <Badge
              className="mt-1 capitalize"
              variant={client.provisioningStatus === "failed" ? "destructive" : "secondary"}
            >
              {provisioningLabel(client.provisioningStatus)}
            </Badge>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Monthly value</h3>
            <p className="mt-1 font-mono">${client.monthlyValue.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Service stack</h3>
            <p className="mt-1">{stackName}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Owner</h3>
            <p className="mt-1">{client.owner ?? "—"}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Industry</h3>
            <p className="mt-1">{client.industry || "—"}</p>
          </div>
          {client.portalClientId && (
            <>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground">
                  Portal client
                </h3>
                <p className="mt-1 font-mono text-sm">{client.portalClientId}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground">
                  Onboarding work item
                </h3>
                <p className="mt-1 font-mono text-sm">{client.onboardingWorkItemId ?? "—"}</p>
              </div>
            </>
          )}
          {client.provisioningError && (
            <div className="md:col-span-2">
              <h3 className="text-xs font-medium uppercase text-destructive">Provisioning error</h3>
              <p className="mt-1 text-sm text-destructive">{client.provisioningError}</p>
            </div>
          )}
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Link
              to="/sales/opportunities/$opportunityId"
              params={{ opportunityId: client.opportunityId }}
              className="text-sm text-primary hover:underline"
            >
              View source opportunity →
            </Link>
            {client.provisioningStatus === "failed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleRetry()}
                disabled={retry.isPending}
              >
                Retry portal provisioning
              </Button>
            )}
          </div>
          <p className="md:col-span-2 text-xs text-muted-foreground">
            Legacy operations console at{" "}
            <Link
              to="/clients/$clientId"
              params={{ clientId: client.id }}
              className="text-primary hover:underline"
            >
              /clients/{client.id.slice(0, 8)}…
            </Link>{" "}
            uses simulated infrastructure until Hostinger provisioning (Phase 4).
          </p>
        </div>
      )}
    </div>
  );
}
