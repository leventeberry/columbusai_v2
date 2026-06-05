import { Link } from "@tanstack/react-router";
import { AlertCircle, Clock, Inbox } from "lucide-react";
import { DashboardDataError } from "@/components/dashboard/dashboard-data-error";
import { useDashboardOperations } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AttentionReason } from "@/lib/dashboard/types";

function reasonIcon(reason: AttentionReason) {
  switch (reason) {
    case "overdue_followup":
      return AlertCircle;
    case "due_soon":
      return Clock;
    default:
      return Inbox;
  }
}

function reasonTone(reason: AttentionReason) {
  switch (reason) {
    case "overdue_followup":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "due_soon":
      return "border-warning/40 bg-warning/10 text-warning";
    default:
      return "border-border/60 bg-muted/40 text-muted-foreground";
  }
}

type Props = {
  onOpenLead?: (leadId: string) => void;
};

export function LeadsAttentionQueue({ onOpenLead }: Props) {
  const { attentionLeads, isLoading, isError, errorMessage } = useDashboardOperations();

  if (isError) {
    return <DashboardDataError message={errorMessage} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (attentionLeads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-8 text-center">
        <p className="text-sm font-medium">No leads need immediate attention</p>
        <p className="mt-1 text-xs text-muted-foreground">
          New inquiries and follow-ups will appear here.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/sales/leads">View all leads</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
      {attentionLeads.map((lead) => {
        const Icon = reasonIcon(lead.reason);
        const content = (
          <div className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-card/50 p-3 text-left transition-colors hover:border-primary/40 hover:bg-card/80">
            <span
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border",
                reasonTone(lead.reason),
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{lead.company}</p>
                  <p className="text-xs text-muted-foreground">{lead.contact}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                  {lead.reasonLabel}
                </Badge>
              </div>
              {lead.nextFollowupAt && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Next follow-up: {new Date(lead.nextFollowupAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );

        if (onOpenLead) {
          return (
            <li key={lead.id}>
              <button
                type="button"
                className="w-full"
                aria-label={`Open lead ${lead.company}`}
                onClick={() => onOpenLead(lead.id)}
              >
                {content}
              </button>
            </li>
          );
        }

        return (
          <li key={lead.id}>
            <Link to="/sales/leads" search={{ leadId: lead.id }} className="block">
              {content}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
