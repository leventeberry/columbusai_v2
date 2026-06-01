import {
  workActivityLabel,
  workPriorityLabel,
  workStatusLabel,
  type WorkActivity,
  type WorkPriority,
  type WorkStatus,
} from "@/data/entities";
import { get as getUser } from "@/data/repositories/users";
import { formatRelative } from "@/data/utils";
import {
  Plus,
  UserCheck,
  ArrowRight,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Flag,
  Eye,
  EyeOff,
  Archive,
  Trash2,
} from "lucide-react";

const icons: Record<WorkActivity["kind"], typeof Plus> = {
  created: Plus,
  assignee_changed: UserCheck,
  status_changed: ArrowRight,
  priority_changed: Flag,
  watcher_added: Eye,
  watcher_removed: EyeOff,
  comment_added: MessageSquare,
  attachment_added: Paperclip,
  attachment_removed: Trash2,
  archived: Archive,
  completed: CheckCircle2,
};

export function ActivityTimeline({ activity }: { activity: WorkActivity[] }) {
  if (activity.length === 0) {
    return <p className="text-xs text-muted-foreground">No activity yet.</p>;
  }
  const sorted = [...activity].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return (
    <ol className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
      {sorted.map((a) => {
        const Icon = icons[a.kind];
        const actor = getUser(a.actorId);
        let detail: React.ReactNode = null;
        if (a.kind === "status_changed") {
          detail = (
            <>
              <span className="font-medium text-foreground/80">{workStatusLabel[a.from as WorkStatus]}</span>
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-medium text-foreground">{workStatusLabel[a.to as WorkStatus]}</span>
            </>
          );
        } else if (a.kind === "assignee_changed") {
          detail = (
            <>
              Assigned to <span className="font-medium text-foreground">{getUser(a.to)?.name ?? "Unassigned"}</span>
            </>
          );
        } else if (a.kind === "priority_changed") {
          detail = (
            <>
              <span>{workPriorityLabel[a.from as WorkPriority]}</span>
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-medium text-foreground">{workPriorityLabel[a.to as WorkPriority]}</span>
            </>
          );
        } else if (a.kind === "attachment_added" && a.to) {
          detail = <span className="font-medium text-foreground">{a.to}</span>;
        }
        return (
          <li key={a.id} className="relative flex items-start gap-3 pl-0">
            <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0 -mt-0.5">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <p className="text-sm">
                  <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                  <span className="text-muted-foreground">{workActivityLabel[a.kind]}</span>
                </p>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatRelative(a.createdAt)}
                </span>
              </div>
              {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
