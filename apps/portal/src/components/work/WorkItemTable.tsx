import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkStatusPill } from "./WorkStatusPill";
import { WorkPriorityChip } from "./WorkPriorityChip";
import { WorkTypeBadge } from "./WorkTypeBadge";
import { type WorkItem } from "@/data/entities";
import { get as getUser } from "@/data/repositories/users";
import { get as getClient } from "@/data/repositories/clients";
import { formatRelative } from "@/data/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type WorkItemTableProps = {
  items: WorkItem[];
  detailBase: "/requests" | "/admin/work";
  showClient?: boolean;
};

export function WorkItemTable({ items, detailBase, showClient = false }: WorkItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium">No work items match your filters</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try clearing filters or switching to a different view.
        </p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          {showClient && <TableHead>Client</TableHead>}
          <TableHead>Type</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((w) => {
          const assignee = getUser(w.primaryAssigneeId);
          const cl = getClient(w.clientId);
          const href =
            detailBase === "/requests"
              ? `/requests/${w.id}`
              : `/admin/work/${w.id}`;
          return (
            <TableRow key={w.id} className="hover:bg-surface-elevated/40">
              <TableCell>
                <Link to={href} className="block">
                  <p className="text-sm font-medium">{w.title}</p>
                  <p className="text-[11px] text-muted-foreground">{w.id}</p>
                </Link>
              </TableCell>
              {showClient && (
                <TableCell className="text-sm text-muted-foreground">{cl?.name ?? "—"}</TableCell>
              )}
              <TableCell><WorkTypeBadge type={w.type} /></TableCell>
              <TableCell><WorkPriorityChip priority={w.priority} /></TableCell>
              <TableCell><WorkStatusPill status={w.status} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-surface-elevated">
                        {assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    {assignee.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground/60">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatRelative(w.createdAt)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatRelative(w.updatedAt)}</TableCell>
              <TableCell>
                <Link to={href} className="text-muted-foreground hover:text-foreground inline-flex">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
