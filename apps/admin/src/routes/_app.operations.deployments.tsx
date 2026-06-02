import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { deployments } from "@/lib/mock/data";
import { StatusDot } from "@/components/dashboard/status-dot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const envTone: Record<string, string> = {
  production: "bg-primary/15 text-primary",
  staging: "bg-warning/15 text-warning",
  preview: "bg-info/15 text-info",
};

export const Route = createFileRoute("/_app/operations/deployments")({
  head: () => ({ meta: [{ title: "Deployments — Columbus AI" }] }),
  component: () => (
    <div>
      <PageHeader title="Deployments" subtitle="Recent ships across all environments." />
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Version</th>
              <th className="px-4 py-2.5 font-medium">Environment</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Deployed by</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {deployments.map((d) => (
              <tr key={d.id} className="hover:bg-accent/30">
                <td className="px-4 py-3 font-mono">{d.version}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] capitalize",
                      envTone[d.env],
                    )}
                  >
                    {d.env}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 capitalize">
                    <StatusDot
                      status={
                        d.status === "in_progress"
                          ? "queued"
                          : d.status === "success"
                            ? "healthy"
                            : "failed"
                      }
                    />
                    {d.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                <td className="px-4 py-3">{d.by}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" className="h-7">
                    Rollback
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7">
                    Logs
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
