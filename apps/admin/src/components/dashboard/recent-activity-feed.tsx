import { Activity, Inbox, MessageSquare, UserPlus, Workflow } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useDashboardOperations } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardActivity } from "@/lib/dashboard/types";

function activityIcon(type: DashboardActivity["type"]) {
  switch (type) {
    case "lead":
      return Inbox;
    case "client":
    case "onboarding":
      return UserPlus;
    case "followup":
      return MessageSquare;
    case "workflow":
      return Workflow;
    default:
      return Activity;
  }
}

export function RecentActivityFeed() {
  const { activity, isLoading } = useDashboardOperations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
      {activity.map((item) => {
        const Icon = activityIcon(item.type);
        const row = (
          <div className="flex items-start gap-3 px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{item.at}</span>
          </div>
        );

        return (
          <li key={item.id}>
            {item.leadId ? (
              <Link
                to="/sales/leads"
                search={{ leadId: item.leadId }}
                className="block transition-colors hover:bg-muted/30"
              >
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}
