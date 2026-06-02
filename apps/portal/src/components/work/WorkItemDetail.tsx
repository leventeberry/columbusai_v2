import { Link } from "@tanstack/react-router";
import { ArrowLeft, UserMinus, UserPlus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/portal/PageHeader";
import { WorkStatusPill } from "./WorkStatusPill";
import { WorkPriorityChip } from "./WorkPriorityChip";
import { WorkTypeBadge } from "./WorkTypeBadge";
import { CommentThread } from "./CommentThread";
import { AttachmentList } from "./AttachmentList";
import { ActivityTimeline } from "./ActivityTimeline";
import { useActivity, useAttachments, useComments, useWorkItem } from "@/hooks/useWorkItems";
import {
  WORK_PRIORITIES,
  WORK_STATUSES,
  workPriorityLabel,
  workStatusLabel,
  type WorkPriority,
  type WorkStatus,
} from "@/data/entities";
import {
  assignWorkItem as assign,
  changePriority,
  changeStatus,
  toggleWatcher,
} from "@/data/services/work-center";
import { get as getUser, list as listUsers } from "@/data/repositories/users";
import { get as getClient } from "@/data/repositories/clients";
import { formatRelative } from "@/data/utils";
import { toast } from "sonner";

export function WorkItemDetail({
  id,
  backHref,
  currentUserId,
  canSeeInternal,
  canEdit,
}: {
  id: string;
  backHref: "/requests" | "/admin/work";
  currentUserId: string;
  canSeeInternal: boolean;
  canEdit: boolean;
}) {
  const item = useWorkItem(id);
  const comments = useComments(id, canSeeInternal);
  const attachments = useAttachments(id);
  const activity = useActivity(id);

  if (!item) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Work item not found"
          description="That item doesn't exist or has been removed."
        />
        <Button asChild variant="outline">
          <Link to={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const cl = getClient(item.clientId);
  const assignee = getUser(item.primaryAssigneeId);
  const agencyUsers = listUsers().filter((u) => u.kind === "agency");

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground mb-2">
          <Link to={backHref}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Work Center
          </Link>
        </Button>
        <PageHeader
          title={item.title}
          description={`${item.id} · ${cl?.name ?? "—"} · Created ${formatRelative(item.createdAt)}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <WorkTypeBadge type={item.type} />
              <WorkPriorityChip priority={item.priority} />
              <WorkStatusPill status={item.status} />
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="surface-card p-6">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{item.description}</p>
          </section>

          <section className="surface-card p-6">
            <Tabs defaultValue="comments">
              <TabsList className="bg-surface border border-border">
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity ({activity.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="mt-4">
                <CommentThread
                  workItemId={item.id}
                  comments={comments}
                  currentUserId={currentUserId}
                  canPostInternal={canSeeInternal}
                />
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <ActivityTimeline activity={activity} />
              </TabsContent>
            </Tabs>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface-card p-6">
            <h3 className="text-sm font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                {canEdit ? (
                  <Select
                    value={item.status}
                    onValueChange={(v) => {
                      changeStatus(item.id, v as WorkStatus, currentUserId);
                      toast.success(`Status → ${workStatusLabel[v as WorkStatus]}`);
                    }}
                  >
                    <SelectTrigger className="bg-background h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {workStatusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <WorkStatusPill status={item.status} />
                )}
              </Row>
              <Row label="Priority">
                {canEdit ? (
                  <Select
                    value={item.priority}
                    onValueChange={(v) => {
                      changePriority(item.id, v as WorkPriority, currentUserId);
                      toast.success(`Priority → ${workPriorityLabel[v as WorkPriority]}`);
                    }}
                  >
                    <SelectTrigger className="bg-background h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {workPriorityLabel[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <WorkPriorityChip priority={item.priority} />
                )}
              </Row>
              <Row label="Type">
                <WorkTypeBadge type={item.type} />
              </Row>
              <Row label="Client">
                <span className="font-medium">{cl?.name ?? "—"}</span>
              </Row>
              <Row label="Last update">
                <span className="font-medium">{formatRelative(item.updatedAt)}</span>
              </Row>
            </dl>
          </section>

          <section className="surface-card p-6">
            <h3 className="text-sm font-semibold mb-3">Assignee</h3>
            {canEdit ? (
              <Select
                value={item.primaryAssigneeId ?? "_none"}
                onValueChange={(v) => {
                  assign(item.id, v === "_none" ? null : v, currentUserId);
                  toast.success("Assignee updated");
                }}
              >
                <SelectTrigger className="bg-background h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Unassigned</SelectItem>
                  {agencyUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : assignee ? (
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-surface-elevated">
                    {assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{assignee.name}</p>
                  <p className="text-[11px] text-muted-foreground">Columbus AI</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Unassigned</p>
            )}

            {item.assigneeIds.length > 1 && (
              <>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Additional
                </p>
                <div className="mt-2 flex -space-x-1.5">
                  {item.assigneeIds.slice(1).map((uid) => {
                    const u = getUser(uid);
                    return (
                      <Avatar key={uid} className="h-6 w-6 ring-2 ring-background">
                        <AvatarFallback className="text-[10px] bg-surface-elevated">
                          {u?.initials ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="surface-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Watchers</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  toggleWatcher(item.id, currentUserId);
                  toast.success(
                    item.watcherIds.includes(currentUserId) ? "Unwatched" : "Now watching",
                  );
                }}
              >
                {item.watcherIds.includes(currentUserId) ? (
                  <>
                    <UserMinus className="mr-1 h-3 w-3" /> Unwatch
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1 h-3 w-3" /> Watch
                  </>
                )}
              </Button>
            </div>
            {item.watcherIds.length === 0 ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3 w-3" /> No watchers
              </p>
            ) : (
              <div className="flex -space-x-1.5">
                {item.watcherIds.map((uid) => {
                  const u = getUser(uid);
                  return (
                    <Avatar key={uid} className="h-6 w-6 ring-2 ring-background" title={u?.name}>
                      <AvatarFallback className="text-[10px] bg-surface-elevated">
                        {u?.initials ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
            )}
          </section>

          <section className="surface-card p-6">
            <h3 className="text-sm font-semibold mb-3">Attachments</h3>
            <AttachmentList
              workItemId={item.id}
              attachments={attachments}
              currentUserId={currentUserId}
              canManage={canEdit}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
