import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/StatusPill";
import { integrations } from "@/lib/mock/portal";
import { Button } from "@/components/ui/button";
import { Plug, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Columbus AI" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Tools connected to your Columbus AI workspace. We manage the technical setup."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((i) => (
          <article key={i.id} className="surface-card p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground">
                  <Plug className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{i.name}</h3>
                  <p className="text-xs text-muted-foreground">{i.purpose}</p>
                </div>
              </div>
              <StatusPill tone={i.tone}>{i.status}</StatusPill>
            </div>

            <div className="rounded-lg border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">Business impact</p>
              <p className="mt-0.5 text-sm font-medium">{i.businessImpact}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border bg-surface-elevated/40 px-2.5 py-2">
                <div className="text-muted-foreground">Last sync</div>
                <div className="font-medium text-foreground/90">{i.lastSync}</div>
              </div>
              <div className="rounded-md border border-border bg-surface-elevated/40 px-2.5 py-2">
                <div className="text-muted-foreground">Account</div>
                <div className="font-medium text-foreground/90 truncate">{i.account}</div>
              </div>
            </div>


            {i.tone !== "online" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Reconnect request sent for ${i.name}`)}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {i.status === "Disconnected" ? "Request connection" : "Request reconnect"}
              </Button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
