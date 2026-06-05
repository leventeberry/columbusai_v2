import { CheckSquare } from "lucide-react";
import { useDashboardOperations } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/lib/dashboard/types";

function priorityTone(p: TaskPriority) {
  switch (p) {
    case "critical":
      return "border-destructive/50 text-destructive";
    case "high":
      return "border-warning/50 text-warning";
    case "medium":
      return "border-primary/40 text-primary";
    default:
      return "border-border/60 text-muted-foreground";
  }
}

function dueLabel(dueDate: string, status: TaskStatus) {
  if (status === "overdue") return "Overdue";
  const due = new Date(dueDate);
  const today = new Date();
  if (due.toDateString() === today.toDateString()) return "Today";
  return due.toLocaleDateString();
}

export function TodaysTasks() {
  const { tasks, isLoading } = useDashboardOperations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-8 text-center">
        <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">Nothing due today</p>
        <p className="mt-1 text-xs text-muted-foreground">Tasks and follow-ups will show here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border border-border/60 bg-card/50 p-3",
            task.status === "overdue" && "border-destructive/30 bg-destructive/[0.03]",
          )}
        >
          <span className="mt-1 h-4 w-4 shrink-0 rounded border border-border/80" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{task.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px] font-normal", priorityTone(task.priority))}>
                {task.priority}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{dueLabel(task.dueDate, task.status)}</span>
              {task.relatedLabel && (
                <span className="text-[11px] text-muted-foreground">· {task.relatedLabel}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
