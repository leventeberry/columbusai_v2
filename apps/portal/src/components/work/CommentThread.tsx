import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type WorkComment } from "@/data/entities";
import { addComment } from "@/data/services/work-center";
import { usePortalWorkMutations } from "@/hooks/useWorkItems";
import { isPortalMockEnabled } from "@/lib/portal-config";
import { get as getUser } from "@/data/repositories/users";
import { formatRelative } from "@/data/utils";

export function CommentThread({
  workItemId,
  comments,
  currentUserId,
  canPostInternal,
}: {
  workItemId: string;
  comments: WorkComment[];
  currentUserId: string;
  canPostInternal: boolean;
}) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const mutations = usePortalWorkMutations();
  const mock = isPortalMockEnabled();

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    const visibility = internal && canPostInternal ? "internal" : "public";
    setSending(true);
    try {
      if (mock) {
        addComment({
          workItemId,
          authorId: currentUserId,
          body: text,
          visibility,
        });
      } else {
        await mutations.addComment({ workItemId, body: text, visibility });
      }
      setBody("");
      setInternal(false);
      toast.success(internal && canPostInternal ? "Internal note added" : "Reply sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const user = getUser(c.authorId);
            const isInternal = c.visibility === "internal";
            return (
              <li
                key={c.id}
                className={`flex gap-3 rounded-lg p-3 ${
                  isInternal
                    ? "bg-[color:var(--status-attention)]/10 border border-[color:var(--status-attention)]/25"
                    : ""
                }`}
              >
                <Avatar
                  className={`h-8 w-8 ${user?.kind === "agency" ? "ring-2 ring-[color:var(--accent)]/30" : ""}`}
                >
                  <AvatarFallback className="text-xs bg-surface-elevated">
                    {user?.initials ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{user?.name ?? "Unknown"}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {user?.kind === "agency" ? "Columbus AI" : "Client"}
                    </span>
                    {isInternal && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--status-attention)]/20 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--status-attention)]">
                        <Lock className="h-2.5 w-2.5" />
                        Internal note
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90 whitespace-pre-line">{c.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 space-y-2">
        <Textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            canPostInternal
              ? "Reply to the client, or toggle to add an internal note…"
              : "Reply to Columbus AI…"
          }
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {canPostInternal ? (
            <div className="flex items-center gap-2">
              <Switch
                id={`internal-${workItemId}`}
                checked={internal}
                onCheckedChange={setInternal}
              />
              <Label
                htmlFor={`internal-${workItemId}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Internal note (hidden from client)
              </Label>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">Press Send to reply</span>
          )}
          <Button size="sm" onClick={() => void send()} disabled={!body.trim() || sending}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}
