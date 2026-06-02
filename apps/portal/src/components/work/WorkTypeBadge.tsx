import { cn } from "@/lib/utils";
import { workTypeLabel, type WorkType } from "@/data/entities";
import {
  Globe,
  Workflow,
  Plug,
  LifeBuoy,
  Rocket,
  Bug,
  Users,
  CreditCard,
  Sparkles,
} from "lucide-react";

const icons: Record<WorkType, typeof Globe> = {
  website: Globe,
  automation: Workflow,
  integration: Plug,
  support: LifeBuoy,
  deployment: Rocket,
  bug: Bug,
  internal: Users,
  billing: CreditCard,
  onboarding: Sparkles,
};

export function WorkTypeBadge({ type, className }: { type: WorkType; className?: string }) {
  const Icon = icons[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {workTypeLabel[type]}
    </span>
  );
}
