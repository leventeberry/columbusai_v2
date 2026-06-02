import {
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  Globe,
  Plug,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import type { TimelineEvent } from "@/lib/mock/platform";

const ICONS = {
  deployment: GitCommit,
  workflow: Workflow,
  alert: AlertTriangle,
  ssl: ShieldCheck,
  dns: Globe,
  integration: Plug,
} as const;

const TONE = {
  info: "text-muted-foreground",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-rose-400",
} as const;

export function HealthTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border/60 pl-4">
      {events.map((e) => {
        const Icon = ICONS[e.kind] ?? CheckCircle2;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[22px] grid h-4 w-4 place-items-center rounded-full border border-border/60 bg-card">
              <Icon className={`h-2.5 w-2.5 ${TONE[e.severity]}`} />
            </span>
            <div className="text-sm">{e.message}</div>
            <div className="text-[11px] text-muted-foreground">{e.ts}</div>
          </li>
        );
      })}
    </ol>
  );
}
