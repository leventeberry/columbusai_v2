import { Link } from "@tanstack/react-router";
import { clients } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const statusTone: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Onboarding: "bg-info/15 text-info",
  "At Risk": "bg-destructive/15 text-destructive",
  Paused: "bg-muted text-muted-foreground",
};

function HealthBar({ value }: { value: number }) {
  const tone = value >= 80 ? "bg-success" : value >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

export function ClientsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Client</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Automations</th>
            <th className="px-4 py-2.5 font-medium">Last activity</th>
            <th className="px-4 py-2.5 font-medium">Monthly</th>
            <th className="px-4 py-2.5 font-medium">Health</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {clients.map((c) => (
            <tr key={c.id} className="group transition-colors hover:bg-accent/30">
              <td className="px-4 py-3">
                <Link to="/clients/$clientId" params={{ clientId: c.id }} className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary/30 to-chart-2/30 text-xs font-semibold">
                    {c.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.industry} · {c.owner}</div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusTone[c.status])}>
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono">{c.automations}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.lastActivity}</td>
              <td className="px-4 py-3 font-mono">${c.monthlyValue.toLocaleString()}</td>
              <td className="px-4 py-3"><HealthBar value={c.health} /></td>
              <td className="px-4 py-3 text-right">
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
