import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/platform/status-pill";
import { ProvisioningProgress } from "@/components/platform/provisioning-progress";
import { ConfirmDialog } from "@/components/platform/confirm-dialog";
import { EmptyState } from "@/components/platform/empty-state";
import { ChevronDown, ChevronRight, Plus, RotateCw, X, Rocket } from "lucide-react";
import {
  stackTemplates,
  workspaces,
} from "@/lib/mock/platform";
import { clients as clientList } from "@/lib/mock/data";
import * as api from "@/lib/platform-api";

export const Route = createFileRoute("/_app/provisioning/queue")({
  head: () => ({ meta: [{ title: "Provisioning Queue — Columbus AI" }] }),
  component: QueuePage,
});

async function run<T extends api.PlatformActionResult>(p: Promise<T>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

function QueuePage() {
  api.usePlatformVersion();
  const jobs = api.getJobs();
  const [open, setOpen] = useState<string | null>(jobs[0]?.id ?? null);

  useEffect(() => {
    const t = setInterval(() => api.tickProvisioning(), 1800);
    return () => clearInterval(t);
  }, []);

  const clientName = (id: string) => clientList.find((c) => c.id === id)?.name ?? id;
  const workspaceName = (id: string) => workspaces.find((w) => w.id === id)?.name ?? id;
  const tplName = (id: string) => stackTemplates.find((t) => t.id === id)?.name ?? id;

  const startNew = () => {
    const c = clientList[Math.floor(Math.random() * clientList.length)];
    const tpl = stackTemplates[Math.floor(Math.random() * stackTemplates.length)];
    run(api.provisionClientStack({ clientId: c.id, templateId: tpl.id, workspaceId: `ws-${c.id}` }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Provisioning queue"
          subtitle="Live state of every stack being provisioned across the platform."
        />
        <Button size="sm" onClick={startNew}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Start provisioning
        </Button>
      </div>
      {jobs.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No provisioning jobs"
          description="Provisioning jobs created from clients, templates, or the command palette appear here in real time."
          action={<Button size="sm" onClick={startNew}><Plus className="mr-1.5 h-3.5 w-3.5" />Start provisioning</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Client</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => {
                const isOpen = open === j.id;
                return (
                  <>
                    <TableRow
                      key={j.id}
                      className="cursor-pointer"
                      onClick={() => setOpen(isOpen ? null : j.id)}
                    >
                      <TableCell>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="font-medium">{clientName(j.clientId)}</TableCell>
                      <TableCell className="text-muted-foreground">{workspaceName(j.workspaceId)}</TableCell>
                      <TableCell>{tplName(j.templateId)}</TableCell>
                      <TableCell>
                        <StatusPill status={j.status} />
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${j.progress}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">{j.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{j.startedAt}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{j.completedAt ?? "—"}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {j.status === "running" && (
                          <ConfirmDialog
                            title="Cancel provisioning job?"
                            description="In-flight steps will be aborted. Partial resources may need cleanup."
                            confirmLabel="Cancel job"
                            variant="danger"
                            onConfirm={() => run(api.cancelProvisioningJob({ jobId: j.id }))}
                            trigger={<Button size="sm" variant="ghost"><X className="mr-1.5 h-3.5 w-3.5" />Cancel</Button>}
                          />
                        )}
                        {j.status === "failed" && (
                          <Button size="sm" variant="outline" onClick={() => run(api.retryProvisioningJob({ jobId: j.id }))}>
                            <RotateCw className="mr-1.5 h-3.5 w-3.5" />Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={j.id + "-detail"}>
                        <TableCell colSpan={9} className="bg-background/30">
                          <div className="space-y-3 p-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                Job <span className="font-mono">{j.id}</span>
                              </div>
                              {j.status === "failed" && (
                                <div className="text-xs text-rose-300">
                                  Failed at step: {j.steps.find((s) => s.status === "failed")?.label ?? "unknown"}
                                </div>
                              )}
                            </div>
                            <ProvisioningProgress steps={j.steps} progress={j.progress} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
