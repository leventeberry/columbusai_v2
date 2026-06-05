import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConvertLead, useSalesLead } from "@/hooks/use-sales";
import { useLeadActivity, useUpdateLeadNotes, useUpdateLeadStatus } from "@/hooks/use-lead-activity";
import { buildDashboardTasks } from "@/lib/dashboard/adapters";
import { useMemo, useState, useEffect } from "react";
import { Clock, Mail, Phone, StickyNote, Activity, Check, Pencil } from "lucide-react";

const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "disqualified", label: "Disqualified" },
] as const;

export function LeadDetailPanel({ leadId }: { leadId: string }) {
  const { data: lead, isLoading, isError } = useSalesLead(leadId);
  const convert = useConvertLead();
  const { data: activity, isLoading: activityLoading } = useLeadActivity(leadId);
  const notesMutation = useUpdateLeadNotes();
  const statusMutation = useUpdateLeadStatus();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    if (lead) setNotesDraft(lead.notes ?? "");
  }, [lead]);

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

  const saveNotes = async () => {
    await notesMutation.mutateAsync({ id: leadId, notes: notesDraft });
    setEditingNotes(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{lead.company}</h2>
        <p className="text-sm text-muted-foreground">{lead.contact}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {lead.status !== "converted_to_opportunity" ? (
            <Select
              value={lead.status}
              onValueChange={(value) =>
                statusMutation.mutate({ id: leadId, status: value })
              }
              disabled={statusMutation.isPending}
            >
              <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs capitalize">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className="capitalize">{lead.status.replace(/_/g, " ")}</Badge>
          )}
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

      {/* Editable notes */}
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5" /> Notes
          </h3>
          {!editingNotes && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setEditingNotes(true)}
            >
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
        </div>
        {lead.summary && <p className="mt-2 text-sm">{lead.summary}</p>}
        {editingNotes ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotesDraft(lead.notes ?? "");
                  setEditingNotes(false);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" disabled={notesMutation.isPending} onClick={saveNotes}>
                <Check className="mr-1 h-3 w-3" />
                {notesMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 min-h-5 whitespace-pre-wrap text-sm text-muted-foreground">
            {lead.notes || "No notes yet."}
          </p>
        )}
      </div>

      {/* Activity timeline (real events from API) */}
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Activity
        </h3>
        {activityLoading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : activity && activity.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {activity.map((ev) => (
              <li key={ev.id} className="flex justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                <div>
                  <span className="font-medium">{ev.title}</span>
                  {ev.detail && (
                    <span className="ml-1 text-muted-foreground">— {ev.detail}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(ev.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
        )}
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

      <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
        {!lead.opportunityId && (
          <Button size="sm" disabled={convert.isPending} onClick={() => convert.mutate(lead.id)}>
            Convert to opportunity
          </Button>
        )}
        <Link
          to="/sales/leads/$leadId"
          params={{ leadId: lead.id }}
          className="text-center text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Open permalink
        </Link>
      </div>
    </div>
  );
}
