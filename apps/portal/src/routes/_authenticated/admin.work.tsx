import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List } from "lucide-react";
import { WorkItemTable } from "@/components/work/WorkItemTable";
import { WorkKanban } from "@/components/work/WorkKanban";
import { WorkMetrics } from "@/components/work/WorkMetrics";
import { NewWorkItemDialog } from "@/components/work/NewWorkItemDialog";
import { useWorkItems } from "@/hooks/useWorkItems";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
import { type WorkStatus } from "@/data/entities";
import { list as listClients } from "@/data/repositories/clients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRole, isAgency } from "@/lib/portal-auth";

export const Route = createFileRoute("/_authenticated/admin/work")({
  head: () => ({ meta: [{ title: "Admin Work Center — Columbus AI" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!isAgency(getRole())) {
      throw redirect({ to: "/requests" });
    }
  },
  component: AdminWorkCenter,
});

type View = "inbox" | "mine" | "needs_review" | "waiting" | "completed" | "all";

function AdminWorkCenter() {
  const { currentUserId, clients } = usePortalWorkspace();
  const all = useWorkItems();
  const defaultClientId = clients[0]?.id ?? "";
  const [view, setView] = useState<View>("inbox");
  const [layout, setLayout] = useState<"list" | "kanban">("list");
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState<string>("_all");

  const filtered = useMemo(() => {
    return all.filter((w) => {
      if (clientId !== "_all" && w.clientId !== clientId) return false;
      if (view === "inbox" && w.status !== "requested") return false;
      if (view === "needs_review" && w.status !== "in_review") return false;
      if (view === "waiting" && w.status !== "waiting_on_client") return false;
      if (view === "completed" && w.status !== "completed") return false;
      if (view === "mine") {
        const mine = w.primaryAssigneeId === currentUserId || w.assigneeIds.includes(currentUserId);
        const closed: WorkStatus[] = ["completed", "cancelled"];
        if (!mine || closed.includes(w.status)) return false;
      }
      if (query && !`${w.title} ${w.id}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [all, view, query, clientId, currentUserId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Work Center"
        description="Every client request and internal task across Columbus AI, in one operational view."
        actions={
          <NewWorkItemDialog
            clientId={clientId === "_all" ? defaultClientId : clientId}
            createdBy={currentUserId}
            buttonLabel="New work item"
            allowAllTypes
          />
        }
      />

      <WorkMetrics items={all} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList className="bg-surface border border-border flex-wrap h-auto">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="mine">Assigned to me</TabsTrigger>
            <TabsTrigger value="needs_review">Needs review</TabsTrigger>
            <TabsTrigger value="waiting">Waiting on client</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All work</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="h-9 w-44 bg-surface border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All clients</SelectItem>
              {listClients().map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full md:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
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
          <WorkItemTable items={filtered} detailBase="/admin/work" showClient />
        </div>
      ) : (
        <WorkKanban items={filtered} detailBase="/admin/work" actorId={currentUserId} />
      )}
    </div>
  );
}
