import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { tickets, type TicketStatus } from "@/lib/mock/portal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({ meta: [{ title: "Support — Columbus AI" }] }),
  component: SupportPage,
});

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/25",
  "In Progress":
    "bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)] border-[color:var(--chart-4)]/25",
  "Waiting on Client":
    "bg-[color:var(--status-attention)]/15 text-[color:var(--status-attention)] border-[color:var(--status-attention)]/25",
  Resolved:
    "bg-[color:var(--status-online)]/15 text-[color:var(--status-online)] border-[color:var(--status-online)]/25",
};

function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Open a request and the Columbus AI team will get back to you."
        actions={<CreateTicketDialog />}
      />

      <div className="surface-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden sm:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium">{t.request}</div>
                  <div className="text-xs text-muted-foreground font-mono">{t.id}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {t.type}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {t.priority}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-xs whitespace-nowrap",
                      statusStyles[t.status],
                    )}
                  >
                    {t.status}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {t.created}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {t.updated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateTicketDialog() {
  const [type, setType] = useState("Website Update");
  const [priority, setPriority] = useState("Normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a support request</DialogTitle>
          <DialogDescription>We typically respond within 2 business hours.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Website Update",
                    "Automation Change",
                    "Integration Issue",
                    "Billing Question",
                    "New Feature Request",
                    "General Support",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="msg">Details</Label>
            <Textarea
              id="msg"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you need…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attach">Attachment (optional)</Label>
            <Input id="attach" type="file" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                toast.success("Support request submitted");
                setSubject("");
                setMessage("");
              }}
            >
              Submit request
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
