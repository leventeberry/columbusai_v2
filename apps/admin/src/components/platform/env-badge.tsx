import { Badge } from "@/components/ui/badge";
import type { EnvKind } from "@/lib/mock/platform";

const TONE: Record<EnvKind, string> = {
  production: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  staging: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  development: "border-sky-500/40 text-sky-300 bg-sky-500/10",
};

export function EnvBadge({ kind }: { kind: EnvKind }) {
  return (
    <Badge variant="outline" className={`gap-1.5 capitalize ${TONE[kind]}`}>
      {kind}
    </Badge>
  );
}
