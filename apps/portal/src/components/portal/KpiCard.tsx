import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  accent?: "online" | "attention" | "issue" | "default";
  className?: string;
}) {
  const accentColor =
    accent === "online"
      ? "text-[color:var(--status-online)]"
      : accent === "attention"
        ? "text-[color:var(--status-attention)]"
        : accent === "issue"
          ? "text-[color:var(--status-issue)]"
          : "text-foreground";
  return (
    <div
      className={cn(
        "surface-card p-5 flex flex-col gap-3 transition hover:border-[color:var(--accent)]/40",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <div className={cn("text-2xl font-semibold tracking-tight", accentColor)}>{value}</div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
