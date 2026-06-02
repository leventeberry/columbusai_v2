import { useState } from "react";
import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const NOTIFICATIONS = [
  { kind: "Failed", title: "Document Intake OCR failed", time: "8m ago" },
  { kind: "New lead", title: "Quanta Capital — $120k", time: "22m ago" },
  { kind: "Client", title: "Cobalt Finance opened a ticket", time: "1h ago" },
  { kind: "Deploy", title: "v2024.11.04 shipped to production", time: "2h ago" },
  { kind: "Billing", title: "Aperture Health invoice paid", time: "3h ago" },
];

function initials(name: string | null | undefined, email: string | null | undefined) {
  const src = (name ?? email ?? "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function Topbar() {
  const palette = useCommandPalette();
  const [notifOpen, setNotifOpen] = useState(false);
  const { profile, user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const name = profile?.display_name || user?.email?.split("@")[0] || "User";
  const role = roles[0] ?? "no role";

  const onSignOut = async () => {
    await signOut();
    navigate({ to: "/login", search: { redirect: "/dashboard" } });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <button
        onClick={() => palette.setOpen(true)}
        className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search clients, workflows, agents…</span>
        <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border/60 px-3 py-2.5 text-sm font-medium">
              Notifications
            </div>
            <ul className="max-h-96 divide-y divide-border/60 overflow-auto">
              {NOTIFICATIONS.map((n, i) => (
                <li key={i} className="px-3 py-2.5 hover:bg-accent/40">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                    <span>{n.kind}</span>
                    <span>{n.time}</span>
                  </div>
                  <div className="mt-0.5 text-sm">{n.title}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/60 px-3 py-2 text-center text-xs text-muted-foreground">
              View all activity
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold uppercase outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
              {initials(profile?.display_name, user?.email)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  {role}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </header>
  );
}
