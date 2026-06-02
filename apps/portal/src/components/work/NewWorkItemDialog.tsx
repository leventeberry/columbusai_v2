import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  WORK_PRIORITIES,
  workPriorityLabel,
  workTypeLabel,
  type WorkPriority,
  type WorkType,
} from "@/data/entities";
import { createWorkItem } from "@/data/services/work-center";
import { usePortalWorkMutations } from "@/hooks/useWorkItems";
import { isPortalMockEnabled } from "@/lib/portal-config";

const CLIENT_TYPES: WorkType[] = ["website", "automation", "integration", "support", "internal"];

export function NewWorkItemDialog({
  clientId,
  createdBy,
  buttonLabel = "New request",
  allowAllTypes = false,
}: {
  clientId: string;
  createdBy: string;
  buttonLabel?: string;
  allowAllTypes?: boolean;
}) {
  const types: WorkType[] = allowAllTypes
    ? [
        "website",
        "automation",
        "integration",
        "support",
        "deployment",
        "bug",
        "internal",
        "billing",
        "onboarding",
      ]
    : CLIENT_TYPES;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkType>(types[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<WorkPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const mutations = usePortalWorkMutations();
  const mock = isPortalMockEnabled();

  const reset = () => {
    setType(types[0]);
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  const submit = async () => {
    if (!clientId) {
      toast.error("Select a client first");
      return;
    }
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    setSubmitting(true);
    try {
      if (mock) {
        createWorkItem({
          title: title.trim(),
          description: description.trim() || "—",
          type,
          priority,
          clientId,
          createdBy,
        });
      } else {
        await mutations.createWorkItem({
          title: title.trim(),
          description: description.trim() || "—",
          type,
          priority,
          clientId,
        });
      }
      toast.success("Request submitted to Columbus AI");
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create work item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!clientId}>
          <Plus className="mr-2 h-4 w-4" /> {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a request</DialogTitle>
          <DialogDescription>
            Tell us what you'd like done. Our team responds within one business day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkType)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {workTypeLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as WorkPriority)}>
                <SelectTrigger className="bg-background">
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
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-title">Title</Label>
            <Input
              id="wi-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              className="bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-desc">Description</Label>
            <Textarea
              id="wi-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share any context, links, or files."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={() => void submit()} disabled={submitting}>
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
