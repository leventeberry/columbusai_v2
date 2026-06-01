import { PageHeader } from "@/components/dashboard/page-header";
import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  subtitle,
  icon: Icon,
  message,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid place-items-center rounded-xl border border-dashed border-border/60 bg-card/30 p-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-sm font-semibold">{message}</h3>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          We're polishing this surface. It'll plug into the same data graph as the rest of the console.
        </p>
      </div>
    </div>
  );
}
