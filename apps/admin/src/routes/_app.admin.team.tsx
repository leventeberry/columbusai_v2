import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import {
  listTeam,
  inviteUser,
  setUserRole,
  removeUser,
  type TeamMember,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_app/admin/team")({
  head: () => ({ meta: [{ title: "Team & Roles — Columbus AI" }] }),
  component: TeamPage,
});

const ROLES: AppRole[] = ["admin", "member", "viewer"];
const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  member: "bg-info/15 text-info",
  viewer: "bg-muted text-muted-foreground",
};

function TeamPage() {
  const { hasRole, isLoading, user } = useAuth();
  const qc = useQueryClient();
  const listFn = useServerFn(listTeam);
  const inviteFn = useServerFn(inviteUser);
  const setRoleFn = useServerFn(setUserRole);
  const removeFn = useServerFn(removeUser);

  const { data: team, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ["admin", "team"],
    queryFn: () => listFn(),
    enabled: !isLoading && hasRole("admin"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "team"] });

  const setRoleMut = useMutation({
    mutationFn: (vars: { user_id: string; role: AppRole }) => setRoleFn({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (user_id: string) => removeFn({ data: { user_id } }),
    onSuccess: () => {
      toast.success("User removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasRole("admin")) return <Navigate to="/unauthorized" />;

  return (
    <div>
      <PageHeader
        title="Team & Roles"
        subtitle="Invite team members and manage who can access what."
        actions={
          <InviteDialog
            onInvite={async (vars) => {
              await inviteFn({ data: vars });
              toast.success(`Invited ${vars.email}`);
              invalidate();
            }}
          />
        }
      />

      <div className="rounded-lg border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Loading team…
                </TableCell>
              </TableRow>
            )}
            {team?.map((m) => {
              const role = (m.roles[0] as AppRole) ?? null;
              const isSelf = m.id === user?.id;
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.display_name || "—"}</span>
                      {m.job_title && (
                        <span className="text-xs text-muted-foreground">{m.job_title}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {role ? (
                        <Badge variant="secondary" className={ROLE_BADGE[role]}>
                          {role}
                        </Badge>
                      ) : (
                        <Badge variant="outline">no role</Badge>
                      )}
                      <Select
                        value={role ?? undefined}
                        onValueChange={(v) =>
                          setRoleMut.mutate({ user_id: m.id, role: v as AppRole })
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue placeholder="Set role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSelf}
                      onClick={() => {
                        if (confirm(`Remove ${m.email}?`)) removeMut.mutate(m.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InviteDialog({
  onInvite,
}: {
  onInvite: (vars: {
    email: string;
    display_name: string;
    password: string;
    role: AppRole;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("member");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Create an account with a temporary password. Share it securely — the user can change it
            after signing in.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await onInvite({ email, display_name: displayName, password, role });
              setOpen(false);
              setEmail("");
              setDisplayName("");
              setPassword("");
              setRole("member");
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="dn">Display name</Label>
            <Input
              id="dn"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="em">Email</Label>
            <Input
              id="em"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Temporary password</Label>
            <Input
              id="pw"
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
