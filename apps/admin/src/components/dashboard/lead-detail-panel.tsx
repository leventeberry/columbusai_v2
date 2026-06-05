import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvertLead, useSalesLead } from "@/hooks/use-sales";
import { buildDashboardTasks } from "@/lib/dashboard/adapters";
import { useMemo } from "react";
import { Clock, Mail, Phone, StickyNote } from "lucide-react";

export function LeadDetailPanel({ leadId }: { leadId: string }) {
  const { data: lead, isLoading, isError } = useSalesLead(leadId);
  const convert = useConvertLead();

  const relatedTasks = useMemo(() => {
    if (!lead) return [];
    return buildDashboardTasks([lead]).filter((t) => t.relatedId === lead.id);
  }, [lead]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !lead) {
    return <p className="text-sm text-destructive">Lead not found or API error.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{lead.company}</h2>
        <p className="text-sm text-muted-foreground">{lead.contact}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge className="capitalize">{lead.status.replace(/_/g, " ")}</Badge>
          <Badge variant="outline" className="capitalize">
            {String(lead.pipelineStage).replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span>{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Follow-up
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[11px] text-muted-foreground">Emails sent</dt>
            <dd className="font-mono">{lead.followupCount}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Next due</dt>
            <dd className="font-mono text-xs">
              {lead.nextFollowupAt ? new Date(lead.nextFollowupAt).toLocaleString() : "—"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] text-muted-foreground">Last follow-up</dt>
            <dd className="font-mono text-xs">
              {lead.lastFollowupAt ? new Date(lead.lastFollowupAt).toLocaleString() : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {(lead.notes || lead.summary) && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <h3 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5" /> Notes
          </h3>
          {lead.summary && <p className="mt-2 text-sm">{lead.summary}</p>}
          {lead.notes && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <h3 className="text-xs font-medium uppercase text-muted-foreground">Timeline</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between gap-2 border-b border-border/40 pb-2">
            <span>Lead created</span>
            <span className="text-xs text-muted-foreground">
              {new Date(lead.createdAt).toLocaleString()}
            </span>
          </li>
          <li className="flex justify-between gap-2 border-b border-border/40 pb-2">
            <span>Last updated</span>
            <span className="text-xs text-muted-foreground">
              {new Date(lead.updatedAt).toLocaleString()}
            </span>
          </li>
          {lead.recommendedNextStep && (
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Suggested: </span>
              {lead.recommendedNextStep}
            </li>
          )}
        </ul>
      </div>

      {relatedTasks.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">Related tasks</h3>
          <ul className="mt-2 space-y-2">
            {relatedTasks.map((t) => (
              <li key={t.id} className="text-sm">
                {t.title}
                <span className="ml-2 text-xs text-muted-foreground">({t.priority})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-2 text-sm md:grid-cols-2">
        <div>
          <h3 className="text-xs font-medium uppercase text-muted-foreground">Service</h3>
          <p className="mt-1">{lead.service}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase text-muted-foreground">Score / value</h3>
          <p className="mt-1 font-mono">
            {lead.score} · ${lead.value.toLocaleString()}
          </p>
        </div>
      </div>

      {lead.opportunityId && (
        <Link
          to="/sales/opportunities/$opportunityId"
          params={{ opportunityId: lead.opportunityId }}
          className="text-sm text-primary hover:underline"
        >
          View linked opportunity →
        </Link>
      )}

      {!lead.opportunityId && (
        <Button size="sm" disabled={convert.isPending} onClick={() => convert.mutate(lead.id)}>
          Convert to opportunity
        </Button>
      )}
    </div>
  );
}
