import { cn } from "@/lib/utils";
import type { WorkStatus } from "@/data/entities";
import { workStatusLabel } from "@/data/entities";

const styles: Record<WorkStatus, string> = {
  requested: "bg-muted text-muted-foreground border-border",
  in_review: "bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)] border-[color:var(--chart-4)]/30",
  planned: "bg-[color:var(--chart-3)]/15 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/30",
  in_progress: "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/30",
  waiting_on_client: "bg-[color:var(--status-attention)]/15 text-[color:var(--status-attention)] border-[color:var(--status-attention)]/30",
  testing: "bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30",
  completed: "bg-[color:var(--status-online)]/15 text-[color:var(--status-online)] border-[color:var(--status-online)]/30",
  cancelled: "bg-muted text-muted-foreground border-border line-through opacity-70",
};

export function WorkStatusPill({ status, className }: { status: WorkStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {workStatusLabel[status]}
    </span>
  );
}
