import {
  Bell,
  CircleDot,
  Check,
  MessageSquare,
  Paperclip,
  PlusCircle,
  RefreshCcw,
  UserPlus,
  Flag,
  CheckCircle2,
  Eye,
  EyeOff,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { WorkActivityKind } from "@/data/entities";
import { CURRENT_AGENCY_USER_ID, CURRENT_CLIENT_USER_ID } from "@/data/mock/db";
import { formatRelative } from "@/data/utils";
import { useNotifications } from "@/hooks/useWorkItems";
import { markAllRead, markRead } from "@/data/services/notifications";
import { getRole, isAgency } from "@/lib/portal-auth";

const kindIcon: Record<WorkActivityKind, typeof Bell> = {
  created: PlusCircle,
  status_changed: RefreshCcw,
  assignee_changed: UserPlus,
  priority_changed: Flag,
  watcher_added: Eye,
  watcher_removed: EyeOff,
  comment_added: MessageSquare,
  attachment_added: Paperclip,
  attachment_removed: Trash2,
  archived: Archive,
  completed: CheckCircle2,
};

export function NotificationsPopover() {
  const [role, setRole] = useState(() => getRole());
  useEffect(() => {
    const sync = () => setRole(getRole());
    window.addEventListener("portal-role-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("portal-role-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const agency = isAgency(role);
  const currentUserId = agency ? CURRENT_AGENCY_USER_ID : CURRENT_CLIENT_USER_ID;
  const { notifications, unreadCount } = useNotifications(currentUserId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => markAllRead(currentUserId)}
            disabled={unreadCount === 0}
          >
            <Check className="mr-1 h-3 w-3" /> Mark all read
          </Button>
        </div>
        <ul className="max-h-[440px] overflow-auto divide-y divide-border">
          {notifications.map((n) => {
            const Icon = kindIcon[n.kind];
            const isRead = n.readAt !== null;
            return (
              <li key={n.id} onClick={() => markRead(n.id, currentUserId)}>
                <Link
                  to={agency ? "/admin/work/$id" : "/requests/$id"}
                  params={{ id: n.workItemId }}
                >
                  <div className="flex gap-3 px-4 py-3 hover:bg-surface-elevated/60 transition">
                    <div className="relative mt-0.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {!isRead && (
                        <CircleDot className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-[color:var(--accent)] text-[color:var(--accent)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatRelative(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {notifications.length === 0 && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              No recent activity
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
