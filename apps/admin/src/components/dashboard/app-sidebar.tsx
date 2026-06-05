import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  Settings,
  Inbox,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Workflow,
  Bot,
  Target,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

type NavItem = { title: string; url: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[]; requiresRole?: AppRole[] };

/** Sprint 1 primary navigation — see docs/product/admin-dashboard-mvp.md */
const PRIMARY_NAV: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/sales/leads", icon: Inbox },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

/** Advanced modules — available but de-emphasized during Sprint 1 */
const MORE_NAV: NavGroup[] = [
  {
    label: "Sales (more)",
    items: [
      { title: "Opportunities", url: "/sales/opportunities", icon: Target },
      { title: "Conversations", url: "/sales/conversations", icon: MessageSquare },
    ],
  },
  {
    label: "Automation",
    items: [
      { title: "Workflows", url: "/automation/workflows", icon: Workflow },
      { title: "AI Agents", url: "/automation/agents", icon: Bot },
    ],
  },
  {
    label: "Operations",
    items: [{ title: "System Health", url: "/operations/health", icon: Activity }],
  },
];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user, roles } = useAuth();
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const name = profile?.display_name || user?.email?.split("@")[0] || "User";
  const role = roles[0];
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-[0_0_24px_-6px_oklch(0.68_0.18_280/0.6)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Columbus AI</span>
            <span className="text-[11px] text-muted-foreground">Operations Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY_NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center gap-1 [&[data-state=open]>svg]:rotate-180">
                More modules
                <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              {MORE_NAV.map((group) => (
                <SidebarGroup key={group.label} className="pt-0">
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                            tooltip={item.title}
                            className="opacity-80"
                          >
                            <Link to={item.url}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold">
            {initials}
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium">{name}</span>
            <span className="text-[11px] text-muted-foreground">
              {role ? ROLE_LABELS[role] : "No role"} · Columbus AI
            </span>
          </div>
          {role === "admin" && (
            <ShieldCheck className="ml-auto h-4 w-4 text-success group-data-[collapsible=icon]:hidden" />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
