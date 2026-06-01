import { health } from "@/lib/mock/data";
import { StatusDot } from "./status-dot";

export function SystemHealth() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {health.map((h) => (
        <div key={h.name} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5">
          <StatusDot status={h.status} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{h.name}</div>
            <div className="truncate text-xs text-muted-foreground">{h.detail}</div>
          </div>
          {h.latency && <span className="font-mono text-xs text-muted-foreground">{h.latency}</span>}
        </div>
      ))}
    </div>
  );
}
