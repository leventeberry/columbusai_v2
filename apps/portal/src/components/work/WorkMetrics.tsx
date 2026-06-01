import { useMemo } from "react";
import type { WorkItem } from "@/data/entities";
import { workTypeLabel } from "@/data/entities";

export function WorkMetrics({ items }: { items: WorkItem[] }) {
  const stats = useMemo(() => {
    const open = items.filter((w) => w.status !== "completed" && w.status !== "cancelled").length;
    const completedThisMonth = items.filter((w) => {
      if (w.status !== "completed") return false;
      const d = new Date(w.updatedAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const completed = items.filter((w) => w.status === "completed");
    const avgHours = completed.length
      ? Math.round(
          completed.reduce((sum, w) => {
            const ms = new Date(w.updatedAt).getTime() - new Date(w.createdAt).getTime();
            return sum + ms / 3_600_000;
          }, 0) / completed.length,
        )
      : 0;
    const byType = items.reduce<Record<string, number>>((acc, w) => {
      acc[w.type] = (acc[w.type] ?? 0) + 1;
      return acc;
    }, {});
    return { open, completedThisMonth, avgHours, byType };
  }, [items]);

  const max = Math.max(1, ...Object.values(stats.byType));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Card label="Open work items" value={String(stats.open)} />
      <Card label="Completed this month" value={String(stats.completedThisMonth)} />
      <Card label="Avg resolution" value={`${stats.avgHours}h`} />
      <div className="surface-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Requests by type</p>
        <div className="mt-2 space-y-1">
          {Object.entries(stats.byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([t, n]) => (
              <div key={t} className="flex items-center gap-2">
                <span className="w-20 text-[11px] text-muted-foreground truncate">
                  {workTypeLabel[t as keyof typeof workTypeLabel] ?? t}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--accent)]"
                    style={{ width: `${(n / max) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[11px] text-muted-foreground">{n}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
