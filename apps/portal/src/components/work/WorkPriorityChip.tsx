import { cn } from "@/lib/utils";
import { workPriorityLabel, type WorkPriority } from "@/data/entities";
import { ChevronDown, ChevronUp, ChevronsUp, Minus } from "lucide-react";

const styles: Record<WorkPriority, string> = {
  low: "text-muted-foreground border-border",
  medium: "text-foreground border-border",
  high: "text-[color:var(--status-attention)] border-[color:var(--status-attention)]/40",
  critical:
    "text-[color:var(--status-issue,oklch(0.6_0.2_25))] border-[color:var(--status-issue,oklch(0.6_0.2_25))]/40",
};

const icons: Record<WorkPriority, typeof ChevronDown> = {
  low: ChevronDown,
  medium: Minus,
  high: ChevronUp,
  critical: ChevronsUp,
};

export function WorkPriorityChip({
  priority,
  className,
}: {
  priority: WorkPriority;
  className?: string;
}) {
  const Icon = icons[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-surface px-1.5 py-0.5 text-[11px] font-medium",
        styles[priority],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {workPriorityLabel[priority]}
    </span>
  );
}
