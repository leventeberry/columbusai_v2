import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { clients, workflows, agents } from "@/lib/mock/data";
import {
  Bot,
  Users,
  Workflow as WIcon,
  LayoutDashboard,
  Rocket,
  ScrollText,
  Coins,
  RotateCw,
  Plus,
  Globe,
  KeyRound,
  Activity,
  ExternalLink,
} from "lucide-react";
import * as api from "@/lib/platform-api";

async function run(p: Promise<api.PlatformActionResult>) {
  const res = await p;
  if (res.success) toast.success(res.message);
  else toast.error(res.error ?? res.message);
  return res;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const close = () => onOpenChange(false);
  const go = (to: string) => {
    close();
    navigate({ to });
  };
  const action = async (p: Promise<api.PlatformActionResult>) => {
    close();
    await run(p);
  };

  const navItems = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Leads", url: "/sales/leads", icon: Users },
      { title: "Clients", url: "/clients", icon: Users },
      { title: "Workflows", url: "/automation/workflows", icon: WIcon },
      { title: "AI Agents", url: "/automation/agents", icon: Bot },
      { title: "Deployments", url: "/operations/deployments", icon: Rocket },
      { title: "Provisioning Queue", url: "/provisioning/queue", icon: Rocket },
      { title: "Stack Templates", url: "/provisioning/templates", icon: Rocket },
      { title: "Domains", url: "/provisioning/domains", icon: Globe },
      { title: "Secrets", url: "/provisioning/secrets", icon: KeyRound },
      { title: "Usage", url: "/analytics/usage", icon: Activity },
      { title: "Audit Log", url: "/admin/audit", icon: ScrollText },
      { title: "Billing", url: "/admin/billing", icon: Coins },
    ],
    [],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search clients, workflows, agents, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => action(api.redeployEnvironment({ environmentId: "current", envLabel: "Production" }))}>
            <RotateCw className="mr-2 h-4 w-4" /> Redeploy current environment
          </CommandItem>
          <CommandItem onSelect={() => action(api.openServiceLogs({ environmentId: "current" }))}>
            <ScrollText className="mr-2 h-4 w-4" /> Open logs
          </CommandItem>
          <CommandItem onSelect={() => action(api.restartService({ serviceId: "redis", serviceName: "Redis" }))}>
            <RotateCw className="mr-2 h-4 w-4" /> Restart Redis
          </CommandItem>
          <CommandItem onSelect={() => action(api.createClientWorkspace({ clientId: clients[0]?.id ?? "c1", name: "New Client" }))}>
            <Plus className="mr-2 h-4 w-4" /> Create client
          </CommandItem>
          <CommandItem onSelect={() => action(api.provisionClientStack({ clientId: clients[0]?.id ?? "c1", templateId: "tpl-ai", workspaceId: `ws-${clients[0]?.id ?? "c1"}` }))}>
            <Rocket className="mr-2 h-4 w-4" /> Provision new stack
          </CommandItem>
          <CommandItem onSelect={() => action(api.addDomain({ host: "new.example.io", environmentId: "current" }))}>
            <Globe className="mr-2 h-4 w-4" /> Add domain
          </CommandItem>
          <CommandItem onSelect={() => action(api.rotateSecret({ secretId: "current", key: "OPENAI_API_KEY" }))}>
            <KeyRound className="mr-2 h-4 w-4" /> Rotate secret
          </CommandItem>
          <CommandItem onSelect={() => action(api.openN8n({}))}>
            <ExternalLink className="mr-2 h-4 w-4" /> Open n8n
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics/usage")}>
            <Activity className="mr-2 h-4 w-4" /> View usage
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {navItems.map((n) => (
            <CommandItem key={n.url} onSelect={() => go(n.url)}>
              <n.icon className="mr-2 h-4 w-4" />
              {n.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Clients">
          {clients.map((c) => (
            <CommandItem key={c.id} onSelect={() => go(`/clients/${c.id}`)}>
              <Users className="mr-2 h-4 w-4" />
              {c.name} <span className="ml-auto text-xs text-muted-foreground">{c.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workflows">
          {workflows.map((w) => (
            <CommandItem key={w.id} onSelect={() => go("/automation/workflows")}>
              <WIcon className="mr-2 h-4 w-4" />
              {w.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="AI Agents">
          {agents.map((a) => (
            <CommandItem key={a.id} onSelect={() => go("/automation/agents")}>
              <Bot className="mr-2 h-4 w-4" />
              {a.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
