import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, KeyRound, Plus, RotateCw, Trash2 } from "lucide-react";
import { secrets, environments, workspaces } from "@/lib/mock/platform";
import { clients } from "@/lib/mock/data";
import { EnvBadge } from "@/components/platform/env-badge";
import { ConfirmDialog } from "@/components/platform/confirm-dialog";
import { EmptyState } from "@/components/platform/empty-state";
import * as api from "@/lib/platform-api";

async function run<T extends api.PlatformActionResult>(p: Promise<T>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

export const Route = createFileRoute("/_app/provisioning/secrets")({
  head: () => ({ meta: [{ title: "Secrets — Columbus AI" }] }),
  component: SecretsPage,
});

function SecretsPage() {
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const wsList = workspaces.filter((w) => w.clientId === clientId);
  const envList = environments.filter((e) => wsList.some((w) => w.id === e.workspaceId));
  const rows = secrets.filter((s) => envList.some((e) => e.id === s.environmentId));

  const toggle = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Secrets" subtitle="Environment-scoped secrets. Values are masked by default." />
        <div className="flex items-center gap-2">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="h-8 w-[220px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => run(api.createSecret({ environmentId: envList[0]?.id ?? "", key: `NEW_SECRET_${Date.now() % 1000}` }))}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add secret
          </Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No secrets for this client"
          description="Secrets are environment-scoped and masked by default. Add API keys, tokens, or credentials needed at runtime."
          action={<Button size="sm" onClick={() => run(api.createSecret({ environmentId: envList[0]?.id ?? "", key: `NEW_SECRET_${Date.now() % 1000}` }))}><Plus className="mr-1.5 h-3.5 w-3.5" />Add secret</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last rotated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const env = environments.find((e) => e.id === s.environmentId)!;
                const isOpen = revealed.has(s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.key}</TableCell>
                    <TableCell><EnvBadge kind={env.kind} /></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {isOpen ? "sk_live_4f9aB2tQrV7nC1hLmZ8x" : s.masked}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.rotatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => toggle(s.id)}>
                        {isOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => run(api.rotateSecret({ secretId: s.id, key: s.key, clientId: env.clientId }))}>
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmDialog
                        title={`Revoke ${s.key}?`}
                        description="Services using this secret will start failing immediately."
                        impact={["Active sessions may fail", "Rotation should be coordinated with the consumer"]}
                        confirmLabel="Revoke"
                        variant="danger"
                        onConfirm={() => run(api.revokeSecret({ secretId: s.id, key: s.key, clientId: env.clientId }))}
                        trigger={
                          <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
