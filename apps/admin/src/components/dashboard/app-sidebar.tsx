import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Workflow,
  Bot,
  Plug,
  BookOpen,
  UsersRound,
  CheckSquare,
  Rocket,
  Activity,
  BarChart3,
  Gauge,
  Coins,
  ShieldCheck,
  ScrollText,
  Settings,
  Inbox,
  MessageSquare,
  Target,
  Sparkles,
  Boxes,
  ListChecks,
  Globe,
  KeyRound,
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
import type { LucideIcon } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

type NavItem = { title: string; url: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[]; requiresRole?: AppRole[] };

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { title: "Leads", url: "/sales/leads", icon: Inbox },
      { title: "Opportunities", url: "/sales/opportunities", icon: Target },
      { title: "Conversations", url: "/sales/conversations", icon: MessageSquare },
    ],
  },
  {
    label: "Clients",
    items: [{ title: "Active Clients", url: "/clients", icon: Users }],
  },
  {
    label: "Provisioning",
    items: [
      { title: "Queue", url: "/provisioning/queue", icon: ListChecks },
      { title: "Templates", url: "/provisioning/templates", icon: Boxes },
      { title: "Domains", url: "/provisioning/domains", icon: Globe },
      { title: "Secrets", url: "/provisioning/secrets", icon: KeyRound },
    ],
  },
  {
    label: "Automation",
    items: [
      { title: "Workflows", url: "/automation/workflows", icon: Workflow },
      { title: "AI Agents", url: "/automation/agents", icon: Bot },
      { title: "Integrations", url: "/automation/integrations", icon: Plug },
      { title: "Knowledge Base", url: "/automation/knowledge", icon: BookOpen },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Team", url: "/operations/team", icon: UsersRound },
      { title: "Tasks", url: "/operations/tasks", icon: CheckSquare },
      { title: "Deployments", url: "/operations/deployments", icon: Rocket },
      { title: "System Health", url: "/operations/health", icon: Activity },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Revenue", url: "/analytics/revenue", icon: Coins },
      { title: "Usage", url: "/analytics/usage", icon: BarChart3 },
      { title: "Performance", url: "/analytics/performance", icon: Gauge },
    ],
  },
  {
    label: "Administration",
    requiresRole: ["admin"],
    items: [
      { title: "Team & Roles", url: "/admin/team", icon: UsersRound },
      { title: "Billing", url: "/admin/billing", icon: Coins },
      { title: "Audit Log", url: "/admin/audit", icon: ScrollText },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user, roles, hasAnyRole } = useAuth();
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
        {NAV.filter((g) => !g.requiresRole || hasAnyRole(g.requiresRole)).map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}
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
