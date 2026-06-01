import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/button";
import { reports, type MonthlyReport } from "@/lib/mock/portal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, FileBarChart2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Columbus AI" }] }),
  component: ReportsPage,
});

const typeAccent: Record<MonthlyReport["type"], string> = {
  "Monthly Performance": "from-[color:var(--accent)]/30 to-transparent",
  "Website Performance": "from-[color:var(--chart-2)]/30 to-transparent",
  "Lead Generation": "from-[color:var(--chart-4)]/30 to-transparent",
  "Automation Performance": "from-[color:var(--chart-3)]/30 to-transparent",
  "Quarterly Review": "from-[color:var(--chart-5)]/30 to-transparent",
};

function ReportsPage() {
  const featured = reports.slice(0, 3);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Business-friendly reports prepared for you each month."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map((r) => (
          <article key={r.id} className={`surface-card p-5 bg-gradient-to-br ${typeAccent[r.type]}`}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileBarChart2 className="h-3.5 w-3.5" />
              {r.type}
            </div>
            <h3 className="mt-2 text-base font-semibold leading-tight">{r.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{r.summary}</p>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`Opening ${r.title}`)}>
                <Eye className="mr-1.5 h-3.5 w-3.5" /> View
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${r.fileName}`)}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.type}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.period}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.generatedAt}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">{r.summary}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Opening ${r.title}`)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${r.fileName}`)}>
                    <Download className="mr-1 h-3.5 w-3.5" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
