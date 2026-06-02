import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { client, teamMembers, type Role } from "@/lib/mock/portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getRole, setRole } from "@/lib/portal-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Columbus AI" }] }),
  component: SettingsPage,
});

const roleBadge: Record<string, string> = {
  owner: "bg-[color:var(--accent)]/15 text-[color:var(--accent)] border-[color:var(--accent)]/25",
  admin:
    "bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)] border-[color:var(--chart-4)]/25",
  viewer: "bg-muted text-muted-foreground border-border",
  agency_admin:
    "bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/25",
  agency_member:
    "bg-[color:var(--chart-3)]/15 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/25",
};

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your company profile, team, and notification preferences."
      />

      <Tabs defaultValue="profile">
        <TabsList className="bg-surface border border-border">
          <TabsTrigger value="profile">Company</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company name" defaultValue={client.name} />
              <Field label="Industry" defaultValue={client.industry} />
              <Field label="Website" defaultValue="https://kdmdermatherapy.com" />
              <Field label="Contact email" defaultValue="kira@kdmdermatherapy.com" />
            </div>
            <div className="pt-2">
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-5 space-y-4">
          <ViewAsRoleCard />
          <div className="surface-card">
            {teamMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-4 border-b border-border last:border-b-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-surface-elevated">
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground">Last login</p>
                  <p className="text-xs font-medium">{m.lastLogin}</p>
                </div>
                <span className="hidden md:inline-flex rounded-full border border-[color:var(--status-online)]/25 bg-[color:var(--status-online)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--status-online)]">
                  {m.status}
                </span>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${roleBadge[m.role]}`}
                >
                  {m.role}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => toast.success(`Role change requested for ${m.name}`)}
                >
                  Change role
                </Button>
              </div>
            ))}
            <div className="p-4">
              <Button variant="outline" onClick={() => toast.success("Invitation sent")}>
                Invite team member
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            {[
              ["New leads", "Get notified when a new lead is captured"],
              ["Automation failures", "Hear when an automation needs attention"],
              ["Monthly reports", "Receive your monthly performance report"],
              ["Support updates", "Replies on your support requests"],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-5">
          <div className="surface-card p-6 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Connected tools live under{" "}
              <span className="text-foreground font-medium">Integrations</span>. This section will
              show individual user-linked accounts in the future.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra step to sign in.</p>
              </div>
              <Switch />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Current password" type="password" defaultValue="" />
              <Field label="New password" type="password" defaultValue="" />
            </div>
            <Button onClick={() => toast.success("Password updated")}>Update password</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} className="bg-background" />
    </div>
  );
}

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  { value: "owner", label: "Client · Owner", hint: "Full client portal access" },
  { value: "admin", label: "Client · Admin", hint: "Most client tools" },
  { value: "viewer", label: "Client · Viewer", hint: "Read-only client" },
  {
    value: "agency_admin",
    label: "Columbus AI · Admin",
    hint: "Full agency operations + admin Work Center",
  },
  {
    value: "agency_member",
    label: "Columbus AI · Team Member",
    hint: "Operations + admin Work Center",
  },
];

function ViewAsRoleCard() {
  const [role, setRoleState] = useState<Role>("owner");
  useEffect(() => {
    setRoleState(getRole());
  }, []);
  const onChange = (v: string) => {
    const r = v as Role;
    setRole(r);
    setRoleState(r);
    toast.success(`Now viewing as ${ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r}`);
  };
  return (
    <div className="surface-card p-5">
      <div className="flex flex-col gap-1 mb-3">
        <p className="text-sm font-semibold">View the portal as</p>
        <p className="text-xs text-muted-foreground">
          Switch between client and Columbus AI agency views. The shared Work Center stays in sync —
          agency views see every client and internal notes.
        </p>
      </div>
      <Select value={role} onValueChange={onChange}>
        <SelectTrigger className="bg-background w-full sm:w-[340px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <span className="font-medium">{o.label}</span>
              <span className="text-muted-foreground"> — {o.hint}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
