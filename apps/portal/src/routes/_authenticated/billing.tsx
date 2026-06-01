import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { client, invoices } from "@/lib/mock/portal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CreditCard, Download, Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({ meta: [{ title: "Billing — Columbus AI" }] }),
  component: BillingPage,
});

const statusStyles = {
  Paid: "bg-[color:var(--status-online)]/15 text-[color:var(--status-online)] border-[color:var(--status-online)]/25",
  Open: "bg-[color:var(--status-attention)]/15 text-[color:var(--status-attention)] border-[color:var(--status-attention)]/25",
  Overdue: "bg-[color:var(--status-issue)]/15 text-[color:var(--status-issue)] border-[color:var(--status-issue)]/25",
};

function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Your plan, payment method, and invoice history."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("We'll email you a payment update link")}>
              <CreditCard className="mr-2 h-4 w-4" /> Update payment method
            </Button>
            <Button onClick={() => toast.success("Plan change request sent")}>
              <Wrench className="mr-2 h-4 w-4" /> Request plan change
            </Button>
          </>
        }
      />

      <section className="surface-card p-6 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</p>
            <h2 className="mt-1 text-xl font-semibold">{client.plan}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Renews on {new Date(client.renewalDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-semibold">${client.monthlyPrice.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {client.services.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--status-online)]" />
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface-elevated/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage this period</span>
            <span className="font-medium">1,718 / 5,000 automation runs</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[34%] bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--chart-4)]" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Invoices</h2>
        <div className="surface-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm">{i.id}</TableCell>
                  <TableCell className="text-muted-foreground">{i.date}</TableCell>
                  <TableCell className="font-medium">{i.amount}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs", statusStyles[i.status])}>
                      {i.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading ${i.id}`)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
