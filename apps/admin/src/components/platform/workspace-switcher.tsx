import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Environment, Workspace } from "@/lib/mock/platform";
import { EnvBadge } from "./env-badge";

export function WorkspaceSwitcher({
  workspaces,
  environments,
  workspaceId,
  environmentId,
  onWorkspaceChange,
  onEnvironmentChange,
}: {
  workspaces: Workspace[];
  environments: Environment[];
  workspaceId: string;
  environmentId: string;
  onWorkspaceChange: (id: string) => void;
  onEnvironmentChange: (id: string) => void;
}) {
  const envsForWs = environments.filter((e) => e.workspaceId === workspaceId);
  return (
    <div className="flex items-center gap-2">
      <Select value={workspaceId} onValueChange={onWorkspaceChange}>
        <SelectTrigger className="h-8 w-[200px] text-xs">
          <SelectValue placeholder="Workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id} className="text-xs">
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={environmentId} onValueChange={onEnvironmentChange}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          {envsForWs.map((e) => (
            <SelectItem key={e.id} value={e.id} className="text-xs">
              <span className="flex items-center gap-2">
                <EnvBadge kind={e.kind} />
                <span className="font-mono text-[11px] text-muted-foreground">{e.domain}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
