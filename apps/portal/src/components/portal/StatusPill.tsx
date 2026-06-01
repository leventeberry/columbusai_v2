import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/mock/portal";

const toneClasses: Record<StatusTone, string> = {
  online: "bg-[color:var(--status-online)]/15 text-[color:var(--status-online)] border-[color:var(--status-online)]/25",
  attention: "bg-[color:var(--status-attention)]/15 text-[color:var(--status-attention)] border-[color:var(--status-attention)]/25",
  issue: "bg-[color:var(--status-issue)]/15 text-[color:var(--status-issue)] border-[color:var(--status-issue)]/25",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "online" && "bg-[color:var(--status-online)]",
          tone === "attention" && "bg-[color:var(--status-attention)]",
          tone === "issue" && "bg-[color:var(--status-issue)]",
          tone === "muted" && "bg-muted-foreground",
        )}
      />
      {children}
    </span>
  );
}
