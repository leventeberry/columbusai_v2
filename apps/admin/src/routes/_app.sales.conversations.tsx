import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/page-header";
import { fetchAdminConversations, type AdminConversation } from "@/lib/conversations.functions";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const sentimentTone = {
  positive: "text-success",
  neutral: "text-muted-foreground",
  negative: "text-destructive",
};

export const Route = createFileRoute("/_app/sales/conversations")({
  head: () => ({ meta: [{ title: "Conversations — Columbus AI" }] }),
  component: ConversationsPage,
});

function ConversationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: () => fetchAdminConversations(),
  });
  const conversations = data?.conversations ?? [];
  const [selected, setSelected] = useState<AdminConversation | null>(null);
  const active = selected ?? conversations[0] ?? null;

  return (
    <div>
      <PageHeader
        title="Conversations"
        subtitle="AI conversations from the chat service (live data)."
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-border/60 bg-card/40">
          <div className="border-b border-border/60 p-2">
            <Input placeholder="Search conversations…" className="h-8" />
          </div>
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-border/50 overflow-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    className={cn(
                      "block w-full px-3 py-2.5 text-left hover:bg-accent/40",
                      active?.id === c.id && "bg-accent/50",
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.agent}</span>
                      <span>{new Date(c.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium">{c.id.slice(0, 8)}…</div>
                    <div className="truncate text-xs text-muted-foreground">{c.preview}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className={sentimentTone[c.sentiment]}>● {c.sentiment}</span>
                      <span className="text-muted-foreground">· {c.messageCount} messages</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          {!active ? (
            <p className="text-sm text-muted-foreground">Select a conversation.</p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <div className="text-sm font-semibold">Conversation {active.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">
                    {active.agent} · {active.channel}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    sentimentTone[active.sentiment],
                  )}
                >
                  {active.sentiment}
                </span>
              </div>
              <div className="space-y-3 py-4 text-sm">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  {active.preview || "No messages yet."}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
