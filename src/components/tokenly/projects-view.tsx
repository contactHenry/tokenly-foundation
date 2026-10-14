import { Gate } from "./role-gate";
import { useRole } from "./workspace-store";
import { toast } from "sonner";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  EmptyState,
  StatusBadge,
  ThresholdProgress,
  type Column,
} from "@/components/tokenly/primitives";
import { models, teamMembers, usageEvents } from "@/lib/mock";
import {
  actions,
  keyStats,
  LAST_DAY,
  maskKey,
  projectMtd,
  relativeTime,
  shift,
  useProjectsStore,
  type ManagedKey,
  type ManagedProject,
} from "./projects-store";

const money = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v < 100 ? 2 : 0,
  });
const memberName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? "Unknown";

function CopyButton({ value, label = "Copy key" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        // Only show the check mark when the copy actually worked.
        navigator.clipboard
          ?.writeText(value)
          .then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
          .catch(() => toast.error("Couldn't copy. Select the text and copy it manually."));
      }}
    >
      {done ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

function projectHealth(pct: number) {
  return pct >= 90
    ? { s: "critical" as const, t: "Over limit risk" }
    : pct >= 75
      ? { s: "warning" as const, t: "Near budget" }
      : { s: "healthy" as const, t: "On track" };
}

/* ---------------- Projects grid ---------------- */
export function ProjectsGrid() {
  const canCreate = useRole().can("manageProjects");
  const { projects, keys } = useProjectsStore();
  const [open, setOpen] = useState(false);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Projects</h3>
          <p className="text-sm text-muted-foreground">
            {projects.length} projects in this workspace
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!canCreate}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {projects.map((p) => {
          const spent = projectMtd(p.id),
            pct = p.budget ? (spent / p.budget) * 100 : 0,
            h = projectHealth(pct);
          const count = keys.filter((k) => k.projectId === p.id && k.status === "active").length;
          return (
            <Link
              key={p.id}
              to="/projects"
              search={{ project: p.id }}
              className="group surface p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-primary">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Owner · {memberName(p.ownerId)}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap">
                  <StatusBadge status={p.status === "paused" ? "neutral" : h.s}>
                    {p.status === "paused" ? "Paused" : h.t}
                  </StatusBadge>
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold">{money(spent)}</span>
                <span className="text-xs text-muted-foreground">
                  of {money(p.budget)} this month
                </span>
              </div>
              <div className="mt-3">
                <ThresholdProgress value={pct} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeyRound className="size-3.5" />
                {count} active {count === 1 ? "key" : "keys"}
              </p>
            </Link>
          );
        })}
      </div>
      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}

function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [budget, setBudget] = useState("500"),
    [owner, setOwner] = useState("usr_01"),
    [error, setError] = useState("");
  const submit = () => {
    const n = name.trim(),
      b = Number(budget);
    if (!n || n.length > 60) return setError("Enter a project name up to 60 characters.");
    if (!Number.isFinite(b) || b <= 0 || b > 1000000)
      return setError("Enter a monthly budget greater than 0.");
    actions.createProject({
      name: n,
      description: description.trim().slice(0, 140),
      budget: b,
      ownerId: owner,
    });
    toast.success(`Project "${n}" created`);
    setName("");
    setDescription("");
    setBudget("500");
    setError("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Projects group API keys, budgets, and members.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Atlas Search"
              maxLength={60}
              autoFocus
            />
          </Field>
          <Field label="Description (optional)">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={140}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly budget (USD)">
              <Input
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </Field>
            <Field label="Owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ---------------- Keys table + flows ---------------- */
export function KeysTable({ projectId }: { projectId?: string }) {
  const { keys, projects } = useProjectsStore();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ManagedKey | null>(null);
  const [rotating, setRotating] = useState<ManagedKey | null>(null);
  const canKeys = useRole().can("manageKeys");
  const rows = keys
    .filter((k) => !projectId || k.projectId === projectId)
    .map((k) => ({ ...k, ...keyStats(k.id) }));
  type Row = (typeof rows)[number];
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Name",
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "key",
      label: "Key",
      render: (r) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
          {maskKey(r)}
          <CopyButton value={maskKey(r)} label={`Copy ${r.name} key id`} />
        </span>
      ),
    },
    ...(projectId
      ? []
      : [
          {
            key: "project",
            label: "Project",
            sortValue: (r: Row) => projectName(r.projectId),
            render: (r: Row) => projectName(r.projectId),
          },
        ]),
    {
      key: "by",
      label: "Created by",
      sortValue: (r) => memberName(r.createdBy),
      render: (r) => <span className="text-muted-foreground">{memberName(r.createdBy)}</span>,
    },
    {
      key: "used",
      label: "Last used",
      sortValue: (r) => r.lastUsedAt,
      render: (r) => <span className="text-muted-foreground">{relativeTime(r.lastUsedAt)}</span>,
    },
    {
      key: "spend",
      label: "30d spend",
      className: "text-right",
      sortValue: (r) => r.spend30,
      render: (r) => money(r.spend30),
    },
    {
      key: "status",
      label: "Status",
      sortValue: (r) => r.status,
      render: (r) => (
        <StatusBadge status={r.status === "active" ? "healthy" : "neutral"}>
          {r.status === "active" ? "Active" : "Revoked"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (r) =>
        r.status === "active" ? (
          !canKeys ? (
            <Gate
              perm="manageKeys"
              disabled={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled
                  aria-label={`Actions for ${r.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            >
              <span />
            </Gate>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Actions for ${r.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setRotating(r)}>
                  <RefreshCw className="size-4" />
                  Rotate key
                </DropdownMenuItem>
                <DropdownMenuItem className="text-critical" onSelect={() => setRevoking(r)}>
                  Revoke key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : null,
    },
  ];
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">API keys</h3>
          <p className="text-sm text-muted-foreground">
            {rows.filter((r) => r.status === "active").length} active ·{" "}
            {rows.filter((r) => r.status === "revoked").length} revoked
          </p>
        </div>
        <Gate
          perm="manageKeys"
          disabled={
            <Button disabled>
              <Plus className="size-4" />
              Create key
            </Button>
          }
        >
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Create key
          </Button>
        </Gate>
      </div>
      {rows.length ? (
        <DataTable rows={rows} columns={columns} />
      ) : (
        <EmptyState
          title="No keys yet"
          description="Create a key to start sending requests from this project."
          action={
            <Button onClick={() => setCreating(true)} disabled={!canKeys}>
              Create key
            </Button>
          }
        />
      )}
      <CreateKeyDialog
        open={creating}
        onOpenChange={setCreating}
        {...(projectId ? { defaultProject: projectId } : {})}
      />
      <RevokeDialog keyItem={revoking} onClose={() => setRevoking(null)} />
      <RotateDialog keyItem={rotating} onClose={() => setRotating(null)} />
    </section>
  );
}

function SecretReveal({
  secret,
  title,
  onDone,
}: {
  secret: string;
  title: string;
  onDone: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Copy this key now and store it somewhere safe.</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-xs">{secret}</code>
        <CopyButton value={secret} />
      </div>
      <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning-muted p-3 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>
          This key won't be shown again. If you lose it, you'll need to rotate or create a new one.
        </p>
      </div>
      <DialogFooter>
        <Button onClick={onDone}>I've saved my key</Button>
      </DialogFooter>
    </>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  defaultProject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultProject?: string;
}) {
  const { projects } = useProjectsStore();
  const [name, setName] = useState(""),
    [project, setProject] = useState(defaultProject ?? ""),
    [cap, setCap] = useState(""),
    [allowed, setAllowed] = useState<string[]>([]),
    [error, setError] = useState(""),
    [secret, setSecret] = useState<string | null>(null);
  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setCap("");
      setAllowed([]);
      setError("");
      setSecret(null);
      setProject(defaultProject ?? "");
    }, 200);
  };
  const submit = () => {
    const n = name.trim(),
      c = cap ? Number(cap) : undefined;
    if (!n || n.length > 60) return setError("Enter a key name up to 60 characters.");
    if (!project) return setError("Choose a project.");
    if (c !== undefined && (!Number.isFinite(c) || c <= 0))
      return setError("Spending cap must be greater than 0.");
    const created = actions.createKey({
      name: n,
      projectId: project,
      allowedModels: allowed,
      ...(c ? { spendCap: c } : {}),
    });
    if (!created) return;
    setSecret(created);
    toast.success(`Key "${n}" created`);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent>
        {secret ? (
          <SecretReveal secret={secret} title="Your new API key" onDone={close} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Keys inherit the project's budget and alerts.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field label="Name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. prod-03"
                  maxLength={60}
                  autoFocus
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Project">
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger aria-label="Project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Spending cap (optional, USD/mo)">
                  <Input
                    type="number"
                    min={1}
                    value={cap}
                    onChange={(e) => setCap(e.target.value)}
                    placeholder="No cap"
                  />
                </Field>
              </div>
              <Field label="Allowed models (none selected = all)">
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                  {models.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={allowed.includes(m.id)}
                        onCheckedChange={(v) =>
                          setAllowed((a) => (v ? [...a, m.id] : a.filter((x) => x !== m.id)))
                        }
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </Field>
              {error && <p className="text-sm text-critical">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button onClick={submit}>Create key</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RevokeDialog({ keyItem, onClose }: { keyItem: ManagedKey | null; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const stats = keyItem ? keyStats(keyItem.id) : null;
  const close = () => {
    setTyped("");
    onClose();
  };
  return (
    <Dialog
      open={!!keyItem}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent>
        {keyItem && stats && (
          <>
            <DialogHeader>
              <DialogTitle>Revoke {keyItem.name}?</DialogTitle>
              <DialogDescription>
                Requests using this key will fail immediately. This can't be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-critical/40 bg-critical-muted p-3 text-sm">
              This key made <strong>{stats.requests7.toLocaleString()} requests</strong> in the last
              7 days and spent {money(stats.spend30)} in the last 30.
            </div>
            <Field label={`Type "${keyItem.name}" to confirm`}>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                aria-label="Confirm key name"
              />
            </Field>
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={typed !== keyItem.name}
                onClick={() => {
                  actions.revokeKey(keyItem.id);
                  toast.success(`${keyItem.name} revoked`);
                  close();
                }}
              >
                Revoke key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RotateDialog({ keyItem, onClose }: { keyItem: ManagedKey | null; onClose: () => void }) {
  const [secret, setSecret] = useState<string | null>(null);
  const close = () => {
    onClose();
    setTimeout(() => setSecret(null), 200);
  };
  return (
    <Dialog
      open={!!keyItem}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent>
        {keyItem &&
          (secret ? (
            <SecretReveal secret={secret} title={`${keyItem.name} rotated`} onDone={close} />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Rotate {keyItem.name}?</DialogTitle>
                <DialogDescription>
                  A new secret replaces {maskKey(keyItem)}. The old secret stops working right away,
                  so update your apps after copying the new one.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const rotated = actions.rotateKey(keyItem.id);
                    if (!rotated) return;
                    setSecret(rotated);
                    toast.success(`${keyItem.name} rotated`);
                  }}
                >
                  <RefreshCw className="size-4" />
                  Rotate key
                </Button>
              </DialogFooter>
            </>
          ))}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Project detail ---------------- */
export function ProjectDetail({ project }: { project: ManagedProject }) {
  const spent = projectMtd(project.id),
    pct = project.budget ? (spent / project.budget) * 100 : 0,
    h = projectHealth(pct);
  const chart = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const d = shift(LAST_DAY, i - 29);
        return {
          date: d.slice(5),
          cost: Number(
            usageEvents
              .filter((e) => e.projectId === project.id && e.date === d)
              .reduce((s, e) => s + e.cost, 0)
              .toFixed(2),
          ),
        };
      }),
    [project.id],
  );
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/projects" search={{}}>
          <ArrowLeft className="size-4" />
          All projects
        </Link>
      </Button>
      <div className="surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <StatusBadge status={project.status === "paused" ? "neutral" : h.s}>
                {project.status === "paused" ? "Paused" : h.t}
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description || "No description"} · Owner {memberName(project.ownerId)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Month-to-date spend</p>
            <p className="text-2xl font-semibold">
              {money(spent)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {money(project.budget)}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-5">
          <ThresholdProgress value={pct} label="Budget used" />
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="surface p-5">
            <h3 className="font-semibold">Daily spend</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={48}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(v) => money(Number(v))}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.12}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <KeysTable projectId={project.id} />
        </TabsContent>
        <TabsContent value="keys" className="mt-6">
          <KeysTable projectId={project.id} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <div className="surface">
            <div className="flex items-center gap-2 border-b p-5">
              <Users className="size-4 text-muted-foreground" />
              <h3 className="font-semibold">Members</h3>
              <span className="text-sm text-muted-foreground">{project.memberIds.length}</span>
            </div>
            {project.memberIds.map((id) => {
              const m = teamMembers.find((t) => t.id === id);
              if (!m) return null;
              return (
                <div key={id} className="flex items-center gap-3 border-b px-5 py-3 last:border-0">
                  <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {m.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {id === project.ownerId ? "Owner" : m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectSettings({ project }: { project: ManagedProject }) {
  const [name, setName] = useState(project.name),
    [description, setDescription] = useState(project.description),
    [budget, setBudget] = useState(String(project.budget)),
    [msg, setMsg] = useState("");
  const canEdit = useRole().can("manageProjects");
  const save = () => {
    const b = Number(budget);
    if (!name.trim() || !Number.isFinite(b) || b <= 0 || b > 1_000_000)
      return setMsg("Enter a name and a budget between $1 and $1,000,000.");
    actions.updateProject(project.id, {
      name: name.trim().slice(0, 60),
      description: description.trim().slice(0, 140),
      budget: b,
    });
    setMsg("Saved.");
  };
  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-4 surface p-5">
        <h3 className="font-semibold">General</h3>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={140}
          />
        </Field>
        <Field label="Monthly budget (USD)">
          <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={!canEdit}>
            Save changes
          </Button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-critical/30 bg-card p-5">
        <div>
          <h3 className="font-semibold">
            {project.status === "paused" ? "Resume project" : "Pause project"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {project.status === "paused"
              ? "Allow requests from this project's keys again."
              : "Temporarily block all requests from this project's keys."}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!canEdit}
          onClick={() => {
            const pausing = project.status !== "paused";
            if (
              pausing &&
              !window.confirm(`Pause ${project.name}? All requests from its keys will be blocked.`)
            )
              return;
            actions.updateProject(project.id, { status: pausing ? "paused" : "active" });
            toast.success(pausing ? `${project.name} paused` : `${project.name} resumed`);
          }}
        >
          {project.status === "paused" ? "Resume" : "Pause"}
        </Button>
      </div>
    </div>
  );
}
