import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { conversations } from "@/lib/mock/data";
import { Input } from "@/components/ui/input";
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
  const [selected, setSelected] = useState(conversations[0]);
  return (
    <div>
      <PageHeader title="Conversations" subtitle="AI conversations across every channel and agent." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-border/60 bg-card/40">
          <div className="border-b border-border/60 p-2">
            <Input placeholder="Search conversations…" className="h-8" />
          </div>
          <ul className="max-h-[60vh] divide-y divide-border/50 overflow-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c)}
                  className={cn(
                    "block w-full px-3 py-2.5 text-left hover:bg-accent/40",
                    selected.id === c.id && "bg-accent/50",
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.agent}</span>
                    <span>{c.timestamp}</span>
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium">{c.user}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.lastMessage}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className={sentimentTone[c.sentiment]}>● {c.sentiment}</span>
                    <span className="text-muted-foreground">· {c.status}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <div className="text-sm font-semibold">{selected.user}</div>
              <div className="text-xs text-muted-foreground">{selected.agent} · {selected.timestamp}</div>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", sentimentTone[selected.sentiment])}>
              {selected.sentiment}
            </span>
          </div>
          <div className="space-y-3 py-4 text-sm">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2">Hi, I'm hitting a sync error with NetSuite.</div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/20 px-3 py-2 text-foreground">
              Looking into it now — checking the last reconciliation run.
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2">{selected.lastMessage}</div>
          </div>
          <div className="mt-3 border-t border-border/60 pt-3">
            <Input placeholder="Reply as agent…" />
          </div>
        </div>
      </div>
    </div>
  );
}
