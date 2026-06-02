import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List } from "lucide-react";
import { WorkItemTable } from "@/components/work/WorkItemTable";
import { WorkKanban } from "@/components/work/WorkKanban";
import { NewWorkItemDialog } from "@/components/work/NewWorkItemDialog";
import { useWorkItems } from "@/hooks/useWorkItems";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import { type WorkStatus } from "@/data/entities";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Work Center — Columbus AI" }] }),
  component: WorkCenterPage,
});

type View = "all" | "open" | "in_progress" | "waiting" | "completed";

function WorkCenterPage() {
  const { activeClientId, currentUserId, isAgency } = usePortalWorkspace();
  const items = useWorkItems({ clientId: activeClientId ?? undefined });
  const [view, setView] = useState<View>("open");
  const [layout, setLayout] = useState<"list" | "kanban">("list");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const closed: WorkStatus[] = ["completed", "cancelled"];
    return items.filter((w) => {
      if (view === "open" && closed.includes(w.status)) return false;
      if (view === "in_progress" && w.status !== "in_progress") return false;
      if (view === "waiting" && w.status !== "waiting_on_client") return false;
      if (view === "completed" && w.status !== "completed") return false;
      if (query && !`${w.title} ${w.id}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, view, query]);

  if (!activeClientId) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Work Center"
          description="No client workspace is linked to your account yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Center"
        description="Submit requests and follow every change Columbus AI ships for your business."
        actions={<NewWorkItemDialog clientId={activeClientId} createdBy={currentUserId} />}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="waiting">Waiting on Client</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search work…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-surface border-border h-9"
            />
          </div>
          <div className="inline-flex rounded-md border border-border bg-surface">
            <Button
              size="icon"
              variant={layout === "list" ? "secondary" : "ghost"}
              className="h-9 w-9 rounded-none"
              onClick={() => setLayout("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={layout === "kanban" ? "secondary" : "ghost"}
              className="h-9 w-9 rounded-none"
              onClick={() => setLayout("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {layout === "list" ? (
        <div className="surface-card overflow-hidden">
          <WorkItemTable items={filtered} detailBase="/requests" />
        </div>
      ) : (
        <WorkKanban
          items={filtered}
          detailBase="/requests"
          actorId={isAgency ? currentUserId : undefined}
        />
      )}
    </div>
  );
}
