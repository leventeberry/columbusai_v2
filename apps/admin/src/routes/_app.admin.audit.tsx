import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { audit } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { RequireRole } from "@/components/auth/require-role";

const typeTone: Record<string, string> = {
  workflow: "bg-primary/15 text-primary",
  agent: "bg-chart-2/20 text-chart-2",
  billing: "bg-success/15 text-success",
  auth: "bg-info/15 text-info",
  system: "bg-muted text-muted-foreground",
  user: "bg-warning/15 text-warning",
};

export const Route = createFileRoute("/_app/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Columbus AI" }] }),
  component: () => (
    <RequireRole roles={["admin"]}>
      <div>
        <PageHeader title="Audit log" subtitle="A complete timeline of everything that touched the system." />
        <ol className="relative border-l border-border/60 pl-6">
          {audit.map((e) => (
            <li key={e.id} className="mb-5">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("rounded px-1.5 py-0.5 capitalize", typeTone[e.type])}>{e.type}</span>
                <span>{e.at}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="font-medium">{e.actor}</span>{" "}
                <span className="text-muted-foreground">{e.action.toLowerCase()}</span>
                {e.target && <span className="text-foreground"> · {e.target}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </RequireRole>
  ),
});
