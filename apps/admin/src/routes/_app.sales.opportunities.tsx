import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSalesOpportunities } from "@/hooks/use-sales";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/sales/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities — Columbus AI" }] }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { data: opportunities, isLoading, isError } = useSalesOpportunities();
  const open = (opportunities ?? []).filter((o) => o.stage !== "lost");
  const totalValue = open.reduce((s, o) => s + (o.value ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle={
          isLoading
            ? "Loading…"
            : `${open.length} active opportunities worth $${(totalValue / 1000).toFixed(0)}k.`
        }
      />
      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
      {isError && (
        <p className="text-sm text-destructive">Could not load opportunities from the API.</p>
      )}
      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Contact</th>
                <th className="px-4 py-2.5 font-medium">Service</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {open.map((o) => (
                <tr key={o.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to="/sales/opportunities/$opportunityId"
                      params={{ opportunityId: o.id }}
                      className="hover:text-primary"
                    >
                      {o.company}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.contact}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.service}</td>
                  <td className="px-4 py-3 capitalize">{o.stage}</td>
                  <td className="px-4 py-3 font-mono">{o.score}</td>
                  <td className="px-4 py-3 text-right font-mono">${o.value.toLocaleString()}</td>
                </tr>
              ))}
              {open.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No opportunities yet. Convert a qualified lead to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
