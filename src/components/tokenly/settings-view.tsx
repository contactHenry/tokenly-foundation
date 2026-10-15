import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  Hash,
  Minus,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
  Webhook,
  Plus,
  Save,
} from "@/components/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconTile, StatusBadge } from "@/components/tokenly/primitives";
import { Gate } from "./role-gate";
import { relative } from "./format";
import {
  NOTIFICATION_TYPES,
  PERMISSIONS,
  ROLES,
  ROLE_PERMS,
  useRole,
  useWorkspace,
  workspaceActions,
  type Channel,
  type Role,
} from "./workspace-store";

const card = "surface p-6";
const TIMEZONES = [
  "UTC",
  "Africa/Lagos",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Singapore",
];
const CURRENCIES = ["USD", "EUR", "GBP", "NGN"];

function General() {
  const { general } = useWorkspace();
  const { can } = useRole();
  const [form, setForm] = useState(general);
  useEffect(() => setForm(general), [general]);
  const dirty = JSON.stringify(form) !== JSON.stringify(general),
    locked = !can("manageWorkspace");
  const save = () => {
    if (!form.name.trim()) {
      toast.error("Workspace name can't be empty");
      return;
    }
    workspaceActions.setGeneral({ ...form, name: form.name.trim() });
    toast.success("Workspace settings saved");
  };
  return (
    <div className={`${card} max-w-2xl space-y-5`}>
      <div className="space-y-1.5">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          value={form.name}
          maxLength={60}
          disabled={locked}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Select
            value={form.timezone}
            disabled={locked}
            onValueChange={(timezone) => setForm({ ...form, timezone })}
          >
            <SelectTrigger aria-label="Timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for daily roll-ups and budget periods.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select
            value={form.currency}
            disabled={locked}
            onValueChange={(currency) => setForm({ ...form, currency })}
          >
            <SelectTrigger aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Display only — invoices stay in USD.</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t pt-5">
        <Button variant="outline" disabled={!dirty} onClick={() => setForm(general)}>
          Discard
        </Button>
        <Gate
          perm="manageWorkspace"
          disabled={
            <Button disabled>
              <Save />
              Save changes
            </Button>
          }
        >
          <Button disabled={!dirty} onClick={save}>
            <Save />
            Save changes
          </Button>
        </Gate>
      </div>
    </div>
  );
}

function Team() {
  const { members, currentUserId } = useWorkspace();
  const { can } = useRole();
  const [inviting, setInviting] = useState(false),
    [email, setEmail] = useState(""),
    [role, setRole] = useState<Role>("Developer"),
    [err, setErr] = useState("");
  const invite = () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 255)
      return setErr("Enter a valid email address.");
    if (members.some((m) => m.email.toLowerCase() === e))
      return setErr("That person is already in this workspace.");
    if (!workspaceActions.invite(e, role))
      return setErr("You can't invite someone with that role.");
    toast.success(`Invite sent to ${e}`);
    setEmail("");
    setErr("");
    setInviting(false);
  };
  const manage = can("manageTeam");
  return (
    <div className="space-y-8">
      <section className="surface">
        <div className="flex items-center justify-between gap-3 border-b p-5">
          <div>
            <h3 className="flex items-center gap-2.5 font-semibold">
              <IconTile icon={Users} tone="teal" size="sm" />
              Members
            </h3>
            <p className="text-sm text-muted-foreground">{members.length} people</p>
          </div>
          <Gate
            perm="manageTeam"
            disabled={
              <Button disabled>
                <UserPlus className="size-4" />
                Invite
              </Button>
            }
          >
            <Button onClick={() => setInviting(true)}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          </Gate>
        </div>
        <ul className="divide-y">
          {members.map((m) => {
            const self = m.id === currentUserId,
              owner = m.role === "Owner";
            return (
              <li
                key={m.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-muted/40 md:grid-cols-[auto_minmax(0,1fr)_10rem_8rem_2.5rem]"
              >
                <span
                  className="grid size-9 place-items-center rounded-full bg-accent text-xs font-semibold text-primary-ink"
                  aria-hidden
                >
                  {m.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {m.name}
                    {self && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{m.email}</span>
                </span>
                <span className="col-span-2 flex items-center gap-2 md:col-span-1">
                  {manage && !owner && !self ? (
                    <Select
                      value={m.role}
                      onValueChange={(r) => {
                        workspaceActions.setRole(m.id, r as Role);
                        toast.success(`${m.name} is now ${r}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-40" aria-label={`Role for ${m.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((r) => r !== "Owner").map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm">{m.role}</span>
                  )}
                </span>
                <span className="col-span-2 text-xs text-muted-foreground md:col-span-1">
                  {m.pending ? (
                    <StatusBadge status="warning">Invite pending</StatusBadge>
                  ) : (
                    <>Active {relative(m.lastActive).toLowerCase()}</>
                  )}
                </span>
                <span className="col-span-2 md:col-span-1">
                  {!owner && !self && (
                    <Gate
                      perm="manageTeam"
                      disabled={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled
                          aria-label={`Remove ${m.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Remove ${m.name}`}
                        onClick={() => {
                          if (!window.confirm(`Remove ${m.name} from the workspace?`)) return;
                          workspaceActions.remove(m.id);
                          toast.success(`${m.name} removed`);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </Gate>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="surface">
        <div className="border-b p-5">
          <h3 className="flex items-center gap-2.5 font-semibold">
            <IconTile icon={ShieldAlert} tone="violet" size="sm" />
            Roles & permissions
          </h3>
          <p className="text-sm text-muted-foreground">What each role can do in this workspace.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-3 text-left font-medium">
                  Permission
                </th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-3 py-3 text-center font-medium">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                  <th scope="row" className="px-5 py-3 text-left font-normal">
                    {p.label}
                  </th>
                  {ROLES.map((r) => {
                    const ok = ROLE_PERMS[r].includes(p.id);
                    return (
                      <td key={r} className="px-3 py-3 text-center">
                        {ok ? (
                          <Check className="mx-auto size-4 text-success" aria-label="Allowed" />
                        ) : (
                          <Minus
                            className="mx-auto size-4 text-muted-foreground"
                            aria-label="Not allowed"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They'll get access once they accept. Preview only — no email is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Email</Label>
              <Input
                id="inv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && invite()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(r) => setRole(r as Role)}>
                <SelectTrigger aria-label="Role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== "Owner").map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_PERMS[role].length} of {PERMISSIONS.length} permissions — see the matrix
                below.
              </p>
            </div>
            {err && (
              <p className="text-sm text-critical" role="alert">
                {err}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button onClick={invite}>
              <UserPlus />
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Notifications() {
  const { prefs, slack } = useWorkspace();
  const channels: [Channel, string][] = [
    ["inApp", "In-app"],
    ["email", "Email"],
    ["slack", "Slack"],
  ];
  return (
    <section className="max-w-3xl surface">
      <div className="border-b p-5">
        <h3 className="flex items-center gap-2.5 font-semibold">
          <IconTile icon={Bell} tone="amber" size="sm" />
          Your notification preferences
        </h3>
        <p className="text-sm text-muted-foreground">
          Only affects what you receive.
          {!slack.connected && " Connect Slack under Integrations to use it."}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th scope="col" className="px-5 py-3 text-left font-medium">
                Event
              </th>
              {channels.map(([, l]) => (
                <th key={l} scope="col" className="px-4 py-3 text-center font-medium">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_TYPES.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/40">
                <th scope="row" className="px-5 py-3 text-left font-normal">
                  {t.label}
                </th>
                {channels.map(([c, l]) => (
                  <td key={c} className="px-4 py-3 text-center">
                    <Switch
                      checked={!!prefs[t.id]?.[c]}
                      disabled={c === "slack" && !slack.connected}
                      aria-label={`${t.label} via ${l}`}
                      onCheckedChange={(v) => {
                        workspaceActions.setPref(t.id, c, v);
                        toast.success(`${t.label}: ${l} ${v ? "on" : "off"}`);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Integrations() {
  const { slack, webhook } = useWorkspace();
  const canEdit = useRole().can("manageWorkspace");
  const [channel, setChannel] = useState(slack.channel),
    [url, setUrl] = useState(webhook.url),
    [err, setErr] = useState("");
  const saveHook = () => {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") throw 0;
    } catch {
      return setErr("Use a full https:// URL.");
    }
    setErr("");
    workspaceActions.setWebhook({ ...webhook, url, enabled: true });
    toast.success("Webhook saved");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon={Hash} tone="violet" />
            <div>
              <h3 className="font-semibold">Slack</h3>
              <p className="text-sm text-muted-foreground">Post alerts to a channel.</p>
            </div>
          </div>
          <StatusBadge status={slack.connected ? "healthy" : "neutral"}>
            {slack.connected ? "Connected" : "Not connected"}
          </StatusBadge>
        </div>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="slack-ch">Channel</Label>
          <Input
            id="slack-ch"
            value={channel}
            maxLength={80}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {slack.connected ? (
            <>
              <Button
                variant="outline"
                disabled={!canEdit}
                onClick={() => {
                  workspaceActions.setSlack({ connected: false, channel });
                  toast.success("Slack disconnected");
                }}
              >
                Disconnect
              </Button>
              <Button
                disabled={!canEdit}
                onClick={() => {
                  workspaceActions.setSlack({ connected: true, channel });
                  toast.success(`Alerts will post to ${channel}`);
                }}
              >
                <Save />
                Save
              </Button>
            </>
          ) : (
            <Gate
              perm="manageWorkspace"
              disabled={
                <Button disabled>
                  <Plus />
                  Connect Slack
                </Button>
              }
            >
              <Button
                onClick={() => {
                  workspaceActions.setSlack({ connected: true, channel });
                  toast.success("Slack connected (preview)");
                }}
              >
                <Plus />
                Connect Slack
              </Button>
            </Gate>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Preview only — no messages are sent yet.
        </p>
      </section>
      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon={Webhook} tone="sky" />
            <div>
              <h3 className="font-semibold">Webhook</h3>
              <p className="text-sm text-muted-foreground">Send alert events to your endpoint.</p>
            </div>
          </div>
          <Switch
            checked={webhook.enabled}
            disabled={!webhook.url || !canEdit}
            aria-label="Enable webhook"
            onCheckedChange={(enabled) => {
              workspaceActions.setWebhook({ ...webhook, enabled });
              toast.success(enabled ? "Webhook enabled" : "Webhook paused");
            }}
          />
        </div>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="hook-url">Endpoint URL</Label>
          <Input
            id="hook-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/tokenly"
          />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label>Signing secret</Label>
          <div className="flex gap-2">
            <Input readOnly value={webhook.secret} className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy signing secret"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(webhook.secret)
                  .then(() => toast.success("Secret copied"))
                  .catch(() => toast.error("Couldn't copy the secret"));
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
        {err && (
          <p className="mt-2 text-sm text-critical" role="alert">
            {err}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={!webhook.url}
            onClick={() => toast.success("Test event queued (preview)")}
          >
            Send test
          </Button>
          <Button onClick={saveHook} disabled={!canEdit}>
            <Save />
            Save
          </Button>
        </div>
      </section>
    </div>
  );
}

export function SettingsView() {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <General />
      </TabsContent>
      <TabsContent value="team">
        <Team />
      </TabsContent>
      <TabsContent value="notifications">
        <Notifications />
      </TabsContent>
      <TabsContent value="integrations">
        <Integrations />
      </TabsContent>
    </Tabs>
  );
}
