import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Plus, RefreshCw, ShieldCheck, Globe } from "lucide-react";
import { domains, environments } from "@/lib/mock/platform";
import { clients } from "@/lib/mock/data";
import { EnvBadge } from "@/components/platform/env-badge";
import { EmptyState } from "@/components/platform/empty-state";
import * as api from "@/lib/platform-api";

async function run<T extends api.PlatformActionResult>(p: Promise<T>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

export const Route = createFileRoute("/_app/provisioning/domains")({
  head: () => ({ meta: [{ title: "Domains — Columbus AI" }] }),
  component: DomainsPage,
});

const TONE = {
  valid: "border-emerald-500/40 text-emerald-300",
  ok: "border-emerald-500/40 text-emerald-300",
  active: "border-emerald-500/40 text-emerald-300",
  expiring: "border-amber-500/40 text-amber-300",
  pending: "border-amber-500/40 text-amber-300",
  invalid: "border-rose-500/40 text-rose-300",
  error: "border-rose-500/40 text-rose-300",
  off: "border-muted-foreground/40 text-muted-foreground",
} as const;

function Pill({ value }: { value: keyof typeof TONE }) {
  return (
    <Badge variant="outline" className={`capitalize ${TONE[value]}`}>
      {value}
    </Badge>
  );
}

function DomainsPage() {
  const addDomain = () => run(api.addDomain({ host: `new-${Date.now() % 1000}.example.io`, environmentId: environments[0]?.id ?? "" }));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Domains" subtitle="Every host pointed at the platform. SSL, DNS, and CDN at a glance." />
        <Button size="sm" onClick={addDomain}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add domain
        </Button>
      </div>
      {domains.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No domains yet"
          description="Add a custom host so traffic can be routed to a client environment. SSL and DNS verification are tracked here."
          action={<Button size="sm" onClick={addDomain}><Plus className="mr-1.5 h-3.5 w-3.5" />Add domain</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>CDN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((d) => {
                const env = environments.find((e) => e.id === d.environmentId)!;
                const client = clients.find((c) => c.id === env.clientId)!;
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <a
                        href={`https://${d.host}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs hover:underline"
                      >
                        {d.host} <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell><EnvBadge kind={env.kind} /></TableCell>
                    <TableCell><Pill value={d.ssl} /></TableCell>
                    <TableCell><Pill value={d.dns} /></TableCell>
                    <TableCell><Pill value={d.cdn} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => run(api.verifyDomain({ domainId: d.id, host: d.host }))}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Verify DNS</Button>
                      <Button size="sm" variant="ghost" onClick={() => run(api.renewSsl({ domainId: d.id, host: d.host }))}><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Renew SSL</Button>
                      <Button size="sm" variant="ghost" onClick={() => run(api.manageRedirects({ domainId: d.id }))}>Redirects</Button>
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
