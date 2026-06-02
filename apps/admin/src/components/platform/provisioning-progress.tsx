import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ProvisioningStep } from "@/lib/mock/platform";

export function ProvisioningProgress({
  steps,
  progress,
}: {
  steps: ProvisioningStep[];
  progress: number;
}) {
  return (
    <div className="space-y-3">
      <Progress value={progress} />
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            {s.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            {s.status === "running" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
            )}
            {s.status === "failed" && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
            {s.status === "pending" && <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />}
            <span className={s.status === "pending" ? "text-muted-foreground" : ""}>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
