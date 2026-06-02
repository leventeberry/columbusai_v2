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
import type { WorkActivityKind } from "@/data/entities";
import { formatRelative } from "@/data/utils";
import { useNotifications } from "@/hooks/useWorkItems";
import { markAllRead, markRead } from "@/data/services/notifications";
import { isPortalMockEnabled } from "@/lib/portal-config";
import { usePortalWorkspace } from "@/hooks/usePortalWorkspace";
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
  const { currentUserId } = usePortalWorkspace();
  const { notifications, unreadCount } = useNotifications();
  const mock = isPortalMockEnabled();
  const agency = isAgency(getRole());

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
            disabled={!mock || unreadCount === 0}
            onClick={() => mock && markAllRead(currentUserId)}
          >
            Mark all read
          </Button>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              You're all caught up.
            </p>
          ) : (
            <ul>
              {notifications.map((n) => {
                const Icon = kindIcon[n.kind] ?? Bell;
                const href = agency ? `/admin/work/${n.workItemId}` : `/requests/${n.workItemId}`;
                return (
                  <li
                    key={n.id}
                    className={`border-b border-border px-4 py-3 hover:bg-surface-elevated/50 transition ${
                      !n.readAt ? "bg-surface-elevated/30" : ""
                    }`}
                  >
                    <Link to={href} className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface border border-border">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          {!n.readAt && (
                            <CircleDot className="h-3 w-3 shrink-0 text-[color:var(--accent)]" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                    </Link>
                    {mock && !n.readAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() => markRead(n.id, currentUserId)}
                      >
                        <Check className="mr-1 h-3 w-3" /> Mark read
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
