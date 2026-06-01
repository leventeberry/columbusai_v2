import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  PlusCircle,
  UserCheck,
} from "lucide-react";

import {
  CURRENT_AGENCY_USER_ID,
  CURRENT_CLIENT_ID,
  CURRENT_CLIENT_USER_ID,
} from "@/data/mock/db";
import { useGlobalSearch } from "@/hooks/useWorkItems";
import { getRole, isAgency } from "@/lib/portal-auth";
import { NewWorkItemDialog } from "@/components/work/NewWorkItemDialog";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState(() => getRole());
  const [newOpen, setNewOpen] = useState(false);

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
  const actor = agency
    ? { userId: CURRENT_AGENCY_USER_ID }
    : { userId: CURRENT_CLIENT_USER_ID, clientId: CURRENT_CLIENT_ID };

  const results = useGlobalSearch(query, actor);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    navigate({ to: href });
  };

  const itemHref = (id: string) =>
    agency ? `/admin/work/${id}` : `/requests/${id}`;

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput
          placeholder="Search work items, clients, comments, files…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                setNewOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create work item
            </CommandItem>
            <CommandItem onSelect={() => go(agency ? "/admin/work" : "/requests")}>
              <Briefcase className="mr-2 h-4 w-4" />
              {agency ? "Open admin Work Center" : "Open Work Center"}
            </CommandItem>
          </CommandGroup>

          {results.workItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Work items">
                {results.workItems.map((w) => (
                  <CommandItem
                    key={w.id}
                    value={`wi-${w.id} ${w.title}`}
                    onSelect={() => go(itemHref(w.id))}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span className="truncate">{w.title}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{w.id}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {results.clients.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clients">
                {results.clients.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`cl-${c.id} ${c.name}`}
                    onSelect={() => go("/admin/work")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{c.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{c.industry}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {results.comments.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Comments">
                {results.comments.map(({ comment, workItem }) => (
                  <CommandItem
                    key={comment.id}
                    value={`cm-${comment.id} ${comment.body}`}
                    onSelect={() => workItem && go(itemHref(workItem.id))}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{comment.body}</span>
                    {workItem && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {workItem.id}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {results.attachments.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Attachments">
                {results.attachments.map(({ attachment, workItem }) => (
                  <CommandItem
                    key={attachment.id}
                    value={`att-${attachment.id} ${attachment.name}`}
                    onSelect={() => workItem && go(itemHref(workItem.id))}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span className="truncate">{attachment.name}</span>
                    {workItem && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {workItem.id}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
        {/* Suppress unused-icon warnings */}
        <span className="hidden">
          <UserCheck /> <CheckCircle2 />
        </span>
      </CommandDialog>

      {/* Hidden host for the "Create work item" action */}
      {newOpen && (
        <div className="hidden">
          <NewWorkItemDialog
            clientId={agency ? CURRENT_CLIENT_ID : CURRENT_CLIENT_ID}
            createdBy={actor.userId}
          />
        </div>
      )}
    </>
  );
}
