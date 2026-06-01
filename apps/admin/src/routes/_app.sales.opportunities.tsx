import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { leads } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/sales/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities — Columbus AI" }] }),
  component: () => {
    const open = leads.filter((l) => l.stage !== "lost");
    return (
      <div>
        <PageHeader title="Opportunities" subtitle={`${open.length} active opportunities worth $${(open.reduce((s, l) => s + l.value, 0) / 1000).toFixed(0)}k.`} />
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Contact</th>
                <th className="px-4 py-2.5 font-medium">Service</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {open.map((l) => (
                <tr key={l.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">{l.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.contact}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.service}</td>
                  <td className="px-4 py-3 capitalize">{l.stage}</td>
                  <td className="px-4 py-3 font-mono">{l.score}</td>
                  <td className="px-4 py-3 text-right font-mono">${l.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
});
