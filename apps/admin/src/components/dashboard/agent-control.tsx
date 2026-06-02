import { useState } from "react";
import { agents as seed } from "@/lib/mock/data";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bot, MoreHorizontal } from "lucide-react";

export function AgentControl() {
  const [agents, setAgents] = useState(seed);
  const toggle = (id: string) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((a) => (
        <div key={a.id} className="glass rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-chart-2/30 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{a.name}</span>
                <span
                  className={`ml-auto inline-flex items-center gap-1 text-[11px] ${a.enabled ? "text-success" : "text-muted-foreground"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${a.enabled ? "bg-success" : "bg-muted-foreground"}`}
                  />
                  {a.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.role}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-md border border-border/60 bg-background/40 p-2 text-center">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Reqs</div>
              <div className="font-mono text-xs">{a.requests.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Avg</div>
              <div className="font-mono text-xs">{a.avgResponseMs}ms</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Cost</div>
              <div className="font-mono text-xs">${a.costToday.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Win</div>
              <div className="font-mono text-xs">{a.successRate}%</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Switch checked={a.enabled} onCheckedChange={() => toggle(a.id)} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Configure agent</DropdownMenuItem>
                <DropdownMenuItem>View logs</DropdownMenuItem>
                <DropdownMenuItem>View analytics</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
