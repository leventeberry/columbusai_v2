import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Workflow } from "lucide-react";
import { leads, type LeadStatus } from "@/lib/mock/portal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Columbus AI" }] }),
  component: LeadsPage,
});

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/25",
  Contacted: "bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)] border-[color:var(--chart-4)]/25",
  Booked: "bg-[color:var(--status-online)]/15 text-[color:var(--status-online)] border-[color:var(--status-online)]/25",
  Closed: "bg-muted text-muted-foreground border-border",
  Lost: "bg-[color:var(--status-issue)]/15 text-[color:var(--status-issue)] border-[color:var(--status-issue)]/25",
};

function LeadsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const matchQ =
          !q ||
          l.name.toLowerCase().includes(q.toLowerCase()) ||
          l.email.toLowerCase().includes(q.toLowerCase()) ||
          l.phone.includes(q);
        const matchS = status === "all" || l.status === status;
        return matchQ && matchS;
      }),
    [q, status],
  );

  const exportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Created", "Last Contacted"];
    const rows = filtered.map((l) => [l.name, l.email, l.phone, l.source, l.status, l.created, l.lastContacted]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Every inquiry captured by your website and automations."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => toast.success("Follow-up automation requested")}>
              <Workflow className="mr-2 h-4 w-4" />
              Request follow-up automation
            </Button>
          </>
        }
      />

      <div className="surface-card">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone…"
              className="pl-9 bg-background"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-48 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden lg:table-cell">Last contacted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id} className="cursor-pointer">
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{l.email}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{l.phone}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{l.source}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs", statusStyles[l.status])}>
                    {l.status}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{l.created}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{l.lastContacted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
