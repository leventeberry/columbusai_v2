import { useMemo, useState } from "react";
import { useSalesLeads } from "@/hooks/use-sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  onOpenLead?: (leadId: string) => void;
};

export function LeadsTable({ onOpenLead }: Props) {
  const { data: leads, isLoading, isError } = useSalesLeads();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const list = leads ?? [];
    const now = Date.now();
    return list.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (urgencyFilter === "overdue") {
        if (!lead.nextFollowupAt || new Date(lead.nextFollowupAt).getTime() >= now) return false;
      }
      if (urgencyFilter === "due_soon") {
        if (!lead.nextFollowupAt) return false;
        const due = new Date(lead.nextFollowupAt).getTime();
        if (due < now || due - now >= 86_400_000) return false;
      }
      if (urgencyFilter === "new" && lead.status !== "new") return false;
      return true;
    });
  }, [leads, statusFilter, urgencyFilter]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Could not load leads.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="disqualified">Disqualified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All leads</SelectItem>
            <SelectItem value="overdue">Overdue follow-up</SelectItem>
            <SelectItem value="due_soon">Due within 24h</SelectItem>
            <SelectItem value="new">New only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Next follow-up</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No leads match filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.company}</TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize font-normal">
                      {lead.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{String(lead.pipelineStage)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.nextFollowupAt
                      ? new Date(lead.nextFollowupAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {onOpenLead && (
                      <Button variant="ghost" size="sm" onClick={() => onOpenLead(lead.id)}>
                        Open
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
