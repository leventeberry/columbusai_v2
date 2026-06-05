import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLead } from "@/lib/sales.functions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (leadId: string) => void;
};

const INITIAL = {
  fname: "",
  lname: "",
  email: "",
  phone: "",
  company: "",
  whatAutomate: "",
  industry: "",
  budget: "",
  timeline: "",
  notes: "",
};

export function CreateLeadDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const valid = form.fname.trim() && form.lname.trim() && form.email.includes("@") && form.whatAutomate.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const lead = await createLead({ data: form });
      await qc.invalidateQueries();
      setForm(INITIAL);
      onOpenChange(false);
      onCreated?.(lead.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>Enter the basic details for a new inbound lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fname">First name *</Label>
              <Input id="fname" value={form.fname} onChange={set("fname")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lname">Last name *</Label>
              <Input id="lname" value={form.lname} onChange={set("lname")} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={set("company")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatAutomate">What they want to automate *</Label>
            <Input id="whatAutomate" value={form.whatAutomate} onChange={set("whatAutomate")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={form.industry} onChange={set("industry")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" value={form.budget} onChange={set("budget")} placeholder="e.g. $10k–25k" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timeline">Timeline</Label>
            <Input id="timeline" value={form.timeline} onChange={set("timeline")} placeholder="e.g. Q3 2026" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={set("notes")} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || submitting}>
              {submitting ? "Creating…" : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
