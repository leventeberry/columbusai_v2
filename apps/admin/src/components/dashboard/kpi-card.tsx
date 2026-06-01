import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  data,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: number;
  data: { x: number; y: number }[];
  icon: LucideIcon;
}) {
  const positive = delta >= 0;
  return (
    <div className="glass relative overflow-hidden rounded-xl p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          {label}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
            positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1">
        <Sparkline data={data} positive={positive} />
      </div>
    </div>
  );
}
