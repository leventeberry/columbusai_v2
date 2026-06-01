import { Badge } from "@/components/ui/badge";
import type { RunStatus } from "@/lib/mock/platform";

const TONE: Record<RunStatus, string> = {
  pending: "border-muted-foreground/40 text-muted-foreground bg-muted/30",
  running: "border-sky-500/40 text-sky-300 bg-sky-500/10",
  success: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  failed: "border-rose-500/40 text-rose-300 bg-rose-500/10",
};

export function StatusPill({ status }: { status: RunStatus }) {
  return (
    <Badge variant="outline" className={`gap-1.5 capitalize ${TONE[status]}`}>
      {status}
    </Badge>
  );
}
