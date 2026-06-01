import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/StatusPill";
import { automations } from "@/lib/mock/portal";
import { Button } from "@/components/ui/button";
import { Workflow, ChevronRight, Wrench } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/automations")({
  head: () => ({ meta: [{ title: "Automations — Columbus AI" }] }),
  component: AutomationsPage,
});

function AutomationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        description="Behind-the-scenes work Columbus AI runs for your business. No technical setup required on your side."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automations.map((a) => (
          <article key={a.id} className="surface-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground">
                  <Workflow className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold leading-tight">{a.name}</h3>
              </div>
              <StatusPill tone={a.status}>{a.statusLabel}</StatusPill>
            </div>

            <div className="rounded-lg border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">Outcome this month</p>
              <p className="mt-0.5 text-lg font-semibold">{a.outcomeCount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{a.outcomeLabel}</span></p>
            </div>

            <p className="text-sm text-muted-foreground">{a.description}</p>

            <dl className="grid grid-cols-3 gap-3 text-center">
              <Metric label="Runs" value={a.runsThisMonth} />
              <Metric label="Success" value={`${a.successRate}%`} />
              <Metric label="Last run" value={a.lastRun} />
            </dl>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
              <RequestChangeDialog name={a.name} />
            </div>

          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-surface-elevated/40 border border-border py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function RequestChangeDialog({ name }: { name: string }) {
  const [note, setNote] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wrench className="mr-1.5 h-3.5 w-3.5" /> Request change
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a change to “{name}”</DialogTitle>
          <DialogDescription>
            Tell us what you'd like adjusted. Our team will respond within one business day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="note">What should change?</Label>
          <Textarea id="note" rows={5} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                toast.success("Change request sent to Columbus AI");
                setNote("");
              }}
            >
              Send request
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
