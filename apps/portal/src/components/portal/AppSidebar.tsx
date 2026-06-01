import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Globe,
  Workflow,
  Plug,
  Users,
  BarChart3,
  FileText,
  CreditCard,
  LifeBuoy,
  Settings,
  Sparkles,
  FileBarChart2,
  Briefcase,
  ListChecks,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { canAccess, getRole, isAgency } from "@/lib/portal-auth";
import { client } from "@/lib/mock/portal";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/mock/portal";

type Item = { title: string; url: string; icon: typeof LayoutDashboard };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Website", url: "/website", icon: Globe },
      { title: "Automations", url: "/automations", icon: Workflow },
      { title: "Integrations", url: "/integrations", icon: Plug },
      { title: "Leads", url: "/leads", icon: Users },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Documents", url: "/documents", icon: FileText },
    ],
  },
  {
    label: "Service",
    items: [
      { title: "Reports", url: "/reports", icon: FileBarChart2 },
      { title: "Work Center", url: "/requests", icon: Briefcase },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Billing", url: "/billing", icon: CreditCard },
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

const operationsGroup: { label: string; items: Item[] } = {
  label: "Operations",
  items: [{ title: "Admin Work Center", url: "/admin/work", icon: ListChecks }],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const [role, setRoleState] = useState<Role>("owner");

  useEffect(() => {
    setRoleState(getRole());
    const onStorage = () => setRoleState(getRole());
    window.addEventListener("storage", onStorage);
    window.addEventListener("portal-role-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("portal-role-changed", onStorage);
    };
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--chart-4)] text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Columbus AI</p>
              <p className="truncate text-[11px] text-muted-foreground">{client.name}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {[...groups, ...(isAgency(role) ? [operationsGroup] : [])].map((group) => {
          const visible = group.items.filter((i) => canAccess(i.url, role));
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => {
                    const active = currentPath === item.url || currentPath.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url} className="flex items-center gap-2.5">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
