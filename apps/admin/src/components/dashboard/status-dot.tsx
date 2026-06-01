import { cn } from "@/lib/utils";

export function StatusDot({
  status,
  className,
}: {
  status: "healthy" | "warning" | "critical" | "running" | "idle" | "failed" | "queued";
  className?: string;
}) {
  const map: Record<string, string> = {
    healthy: "bg-success shadow-[0_0_0_3px_oklch(0.72_0.17_155/0.2)]",
    running: "bg-success shadow-[0_0_0_3px_oklch(0.72_0.17_155/0.2)]",
    warning: "bg-warning shadow-[0_0_0_3px_oklch(0.78_0.16_75/0.2)]",
    queued: "bg-info shadow-[0_0_0_3px_oklch(0.70_0.14_230/0.2)]",
    critical: "bg-destructive shadow-[0_0_0_3px_oklch(0.62_0.21_25/0.2)]",
    failed: "bg-destructive shadow-[0_0_0_3px_oklch(0.62_0.21_25/0.2)]",
    idle: "bg-muted-foreground/60",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", map[status], className)} />;
}
