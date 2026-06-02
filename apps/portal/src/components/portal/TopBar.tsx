import { Search, LogOut, ChevronDown, UserCog } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsPopover } from "@/components/portal/NotificationsPopover";
import { GlobalSearch } from "@/components/search/GlobalSearch";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "@tanstack/react-router";
import { getRole, setRole, signOut } from "@/lib/portal-auth";
import { currentUser } from "@/lib/mock/portal";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/mock/portal";

export function TopBar() {
  const navigate = useNavigate();
  const [role, setR] = useState<Role>("owner");
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => setR(getRole()), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onRoleChange = (r: string) => {
    setRole(r as Role);
    setR(r as Role);
    window.dispatchEvent(new Event("portal-role-changed"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur md:px-5">
      <SidebarTrigger className="text-muted-foreground" />
      <button
        onClick={() => setSearchOpen(true)}
        className="relative hidden md:flex flex-1 max-w-md h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm text-muted-foreground hover:bg-surface-elevated transition"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search work, clients, comments…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsPopover />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 hover:bg-surface-elevated transition">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--chart-4)] text-primary-foreground text-xs">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-xs font-medium">{currentUser.name.split(" ")[0]}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserCog className="h-3.5 w-3.5" /> Preview role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role} onValueChange={onRoleChange}>
              <DropdownMenuRadioItem value="owner">Owner</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="viewer">Viewer</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void signOut().then(() => navigate({ to: "/login" }));
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
