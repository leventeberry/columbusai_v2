import { workflows } from "@/lib/mock/data";
import { StatusDot } from "./status-dot";
import { Activity, CheckCircle2, XCircle, Percent, type LucideIcon } from "lucide-react";

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      <span className={`grid h-9 w-9 place-items-center rounded-md ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-mono text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

export function WorkflowMonitoring() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Activity} label="Running" value="42" tone="bg-info/15 text-info" />
        <Metric
          icon={CheckCircle2}
          label="Completed today"
          value="3,184"
          tone="bg-success/15 text-success"
        />
        <Metric
          icon={XCircle}
          label="Failed today"
          value="14"
          tone="bg-destructive/15 text-destructive"
        />
        <Metric
          icon={Percent}
          label="Success rate"
          value="98.7%"
          tone="bg-primary/15 text-primary"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <StatusDot status={w.status} />
                  {w.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                  {w.status} · {w.lastRun}
                </div>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{w.successRate}%</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Runs</div>
                <div className="font-mono text-sm">{w.runs.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Avg runtime</div>
                <div className="font-mono text-sm">{w.avgRuntime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
