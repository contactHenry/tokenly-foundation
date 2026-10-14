import { IconTile } from "@/components/tokenly/primitives";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CalendarClock,
  Check,
  CreditCard,
  KeyRound,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable, StatusBadge, type Column } from "@/components/tokenly/primitives";
import { apiKeys, projects, teamMembers } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Gate } from "@/components/tokenly/role-gate";
import { useRole } from "@/components/tokenly/workspace-store";
import {
  alertHistory,
  budgetSpend,
  fmtDate,
  limitActions,
  periodEnd,
  projectHit,
  scopeName,
  useLimitsStore,
  type AlertRule,
  type AlertRuleType,
  type AlertStatus,
  type BudgetRule,
  type Channel,
  type LimitAction,
  type Period,
  type Scope,
} from "./limits-store";

const money = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v < 100 ? 2 : 0,
  });
const periodWord: Record<Period, string> = { daily: "daily", weekly: "weekly", monthly: "monthly" };
const actionMeta: Record<
  LimitAction,
  { label: string; desc: string; tone: "neutral" | "warning" | "critical" }
> = {
  notify: {
    label: "Notify only",
    desc: "Requests keep working; recipients are alerted.",
    tone: "neutral",
  },
  throttle: {
    label: "Throttle",
    desc: "Requests are slowed to 10% of normal rate.",
    tone: "warning",
  },
  stop: {
    label: "Hard stop",
    desc: "All requests are blocked until the next period.",
    tone: "critical",
  },
};
const names = (ids: string[]) => {
  const n = ids
    .map((id) => teamMembers.find((m) => m.id === id)?.name.split(" ")[0])
    .filter(Boolean) as string[];
  return n.length <= 2 ? n.join(" and ") : `${n.slice(0, 2).join(", ")} and ${n.length - 2} more`;
};

export function budgetSentence(b: BudgetRule) {
  const who = scopeName(b.scope, b.targetId),
    first = b.thresholds.filter((t) => t < 100);
  const notify = first.length
    ? `Notify ${names(b.recipients) || "no one"} when ${who} reaches ${first.join("% and ")}% of its ${money(b.amount)} ${periodWord[b.period]} budget`
    : `Watch ${who}'s ${money(b.amount)} ${periodWord[b.period]} budget`;
  const at =
    b.action === "notify"
      ? "and again when it's used up."
      : b.action === "throttle"
        ? "and throttle requests when it's used up."
        : "and block all requests when it's used up.";
  return `${notify}, ${at}`;
}

function Meter({ value, thresholds }: { value: number; thresholds: number[] }) {
  const tone = value >= 100 ? "bg-critical" : value >= 80 ? "bg-warning" : "bg-success";
  return (
    <div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
        {thresholds.map((t) => (
          <span
            key={t}
            className="absolute -top-1 h-4 w-px bg-foreground/40"
            style={{ left: `calc(${Math.min(t, 100)}% - ${t >= 100 ? 1 : 0}px)` }}
          />
        ))}
      </div>
      <div className="relative mt-1.5 h-3 text-[10px] text-muted-foreground">
        {thresholds.map((t) => (
          <span
            key={t}
            className={cn("absolute", t >= 100 ? "-translate-x-full" : "-translate-x-1/2")}
            style={{ left: `${Math.min(t, 100)}%` }}
          >
            {t}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Budgets ---------------- */
export function BudgetsSection({ focusProject }: { focusProject?: string }) {
  const canEdit = useRole().can("manageLimits");
  const { budgets } = useLimitsStore();
  const [editing, setEditing] = useState<BudgetRule | "new" | null>(null);
  useEffect(() => {
    if (focusProject) {
      const b = budgets.find((x) => x.scope === "project" && x.targetId === focusProject);
      if (b) setEditing(b);
    }
  }, [focusProject]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 font-semibold">
            <IconTile icon={Wallet} tone="amber" size="sm" />
            Budgets
          </h3>
          <p className="pl-[38px] text-sm text-muted-foreground">
            Limits that stop overspend before it happens.
          </p>
        </div>
        <Gate
          perm="manageLimits"
          disabled={
            <Button disabled>
              <Plus className="size-4" />
              New budget
            </Button>
          }
        >
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            New budget
          </Button>
        </Gate>
      </div>
      <div className="divide-y surface">
        {budgets.map((b) => {
          const spent = budgetSpend(b),
            pct = (spent / b.amount) * 100,
            hit = projectHit(b),
            a = actionMeta[b.action];
          return (
            <div key={b.id} className="grid gap-4 p-5 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-4 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {b.scope === "org" ? "Org" : b.scope === "project" ? "Project" : "Key"}
                  </span>
                  <p className="truncate font-medium">{scopeName(b.scope, b.targetId)}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {budgetSentence(b)}
                </p>
              </div>
              <div className="lg:col-span-4">
                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span>
                    <span className="font-semibold">{money(spent)}</span>{" "}
                    <span className="text-muted-foreground">
                      of {money(b.amount)} · {periodWord[b.period]}
                    </span>
                  </span>
                  <span className="text-xs font-medium">{Math.round(pct)}%</span>
                </div>
                <Meter value={pct} thresholds={b.thresholds} />
                <p
                  className={cn(
                    "mt-1 text-xs",
                    hit?.reached
                      ? "text-critical"
                      : hit?.withinPeriod
                        ? "text-warning"
                        : "text-muted-foreground",
                  )}
                >
                  {!hit
                    ? "No recent usage"
                    : hit.reached
                      ? "Limit reached"
                      : hit.withinPeriod
                        ? `Projected to hit limit ${fmtDate(hit.date)}`
                        : "On pace to stay under"}
                </p>
              </div>
              <div className="lg:col-span-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  At limit
                </p>
                <div className="mt-1">
                  <StatusBadge status={a.tone === "neutral" ? "neutral" : a.tone}>
                    {a.label}
                  </StatusBadge>
                </div>
              </div>
              <div className="flex gap-1 lg:col-span-1 lg:justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit budget for ${scopeName(b.scope, b.targetId)}`}
                  disabled={!canEdit}
                  onClick={() => setEditing(b)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete budget for ${scopeName(b.scope, b.targetId)}`}
                  disabled={!canEdit}
                  onClick={() => {
                    limitActions.deleteBudget(b.id);
                    toast("Budget deleted", {
                      action: { label: "Undo", onClick: () => limitActions.saveBudget(b) },
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <BudgetDrawer budget={editing} onClose={() => setEditing(null)} />
    </section>
  );
}

const steps = ["Scope", "Amount", "Thresholds", "Action", "Notify"];
function BudgetDrawer({
  budget,
  onClose,
}: {
  budget: BudgetRule | "new" | null;
  onClose: () => void;
}) {
  const blank: BudgetRule = {
    id: "",
    scope: "project",
    targetId: projects[0]?.id ?? "",
    amount: 500,
    period: "monthly",
    thresholds: [50, 80, 100],
    action: "notify",
    recipients: ["usr_01"],
  };
  const [draft, setDraft] = useState<BudgetRule>(blank),
    [step, setStep] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    if (budget) {
      setDraft(budget === "new" ? blank : budget);
      setStep(0);
      setError("");
    }
  }, [budget]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (p: Partial<BudgetRule>) => setDraft((d) => ({ ...d, ...p }));
  const valid = () => {
    if (!Number.isFinite(draft.amount) || draft.amount <= 0 || draft.amount > 1000000)
      return "Enter an amount greater than $0.";
    if (!draft.thresholds.length) return "Pick at least one threshold.";
    if (!draft.recipients.length) return "Choose at least one person to notify.";
    return "";
  };
  const save = () => {
    const e = valid();
    if (e) return setError(e);
    limitActions.saveBudget({ ...draft, id: draft.id || `bud_${Date.now().toString(36)}` });
    toast.success(draft.id ? "Budget updated" : "Budget created");
    onClose();
  };
  const hit = projectHit(draft),
    spent = budgetSpend(draft);
  const targets =
    draft.scope === "project"
      ? projects.map((p) => ({ id: p.id, name: p.name }))
      : draft.scope === "key"
        ? apiKeys.map((k) => ({ id: k.id, name: k.name }))
        : [];
  const preview = !hit
    ? "There's no recent usage in this scope, so there's nothing to project yet."
    : hit.reached
      ? `You've already spent ${money(spent)} — this limit is reached now.`
      : `At your current burn rate, you'll hit this limit on ${fmtDate(hit.date)}.`;
  return (
    <Sheet
      open={!!budget}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6">
          <SheetTitle>{budget !== "new" && budget ? "Edit budget" : "New budget"}</SheetTitle>
          <SheetDescription>
            Step {step + 1} of 5 · {steps[step]}
          </SheetDescription>
          <ol className="mt-4 flex gap-1.5">
            {steps.map((s, i) => (
              <li key={s} className="flex-1">
                <button type="button" onClick={() => setStep(i)} className="w-full text-left">
                  <span
                    className={cn("block h-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")}
                  />
                  <span
                    className={cn(
                      "mt-1.5 block text-[11px]",
                      i === step ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {step === 0 && (
            <>
              <Choice<Scope>
                value={draft.scope}
                onChange={(scope) =>
                  up({
                    scope,
                    targetId:
                      scope === "org"
                        ? "org_01"
                        : scope === "project"
                          ? (projects[0]?.id ?? "")
                          : (apiKeys[0]?.id ?? ""),
                  })
                }
                options={[
                  ["org", "Organization", "Covers all spend in Acme Studio."],
                  ["project", "Project", "One project and all its keys."],
                  ["key", "API key", "A single key."],
                ]}
              />
              {draft.scope !== "org" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {draft.scope === "project" ? "Project" : "Key"}
                  </Label>
                  <Select value={draft.targetId} onValueChange={(targetId) => up({ targetId })}>
                    <SelectTrigger aria-label="Budget target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targets.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount (USD)</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.amount || ""}
                  onChange={(e) => up({ amount: Number(e.target.value) })}
                  aria-label="Budget amount"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Period</Label>
                <Select value={draft.period} onValueChange={(v) => up({ period: v as Period })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                Spent so far this period: {money(spent)}
                {draft.period === "monthly" ? ` · resets ${fmtDate("2026-10-01")}` : ""}
              </p>
            </div>
          )}
          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Get warned at each of these points.</p>
              <div className="grid grid-cols-3 gap-2">
                {[50, 75, 80, 90, 100].map((t) => {
                  const on = draft.thresholds.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        up({
                          thresholds: on
                            ? draft.thresholds.filter((x) => x !== t)
                            : [...draft.thresholds, t].sort((a, b) => a - b),
                        })
                      }
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium",
                        on ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
                      )}
                    >
                      {t}%
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {money((draft.amount * t) / 100)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Meter value={(spent / (draft.amount || 1)) * 100} thresholds={draft.thresholds} />
            </>
          )}
          {step === 3 && (
            <Choice<LimitAction>
              value={draft.action}
              onChange={(action) => up({ action })}
              options={(Object.keys(actionMeta) as LimitAction[]).map((k) => [
                k,
                actionMeta[k].label,
                actionMeta[k].desc,
              ])}
            />
          )}
          {step === 4 && (
            <div className="space-y-2">
              {teamMembers.map((m) => (
                <label key={m.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <Checkbox
                    checked={draft.recipients.includes(m.id)}
                    onCheckedChange={(v) =>
                      up({
                        recipients: v
                          ? [...draft.recipients, m.id]
                          : draft.recipients.filter((x) => x !== m.id),
                      })
                    }
                  />
                  <span className="flex-1">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </label>
              ))}
            </div>
          )}
          <div className="space-y-2 rounded-xl border bg-muted/40 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Live preview
            </p>
            <p
              className={cn(
                "text-sm font-medium",
                hit?.reached
                  ? "text-critical"
                  : hit && hit.date <= periodEnd(draft.period)
                    ? "text-warning"
                    : "",
              )}
            >
              {preview}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{budgetSentence(draft)}</p>
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
        </div>
        <div className="flex justify-between gap-2 border-t p-4">
          <Button variant="outline" onClick={() => (step ? setStep(step - 1) : onClose())}>
            {step ? "Back" : "Cancel"}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={save}>
              <Check className="size-4" />
              Save budget
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Choice<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string, string][];
}) {
  return (
    <div role="radiogroup" className="space-y-2">
      {options.map(([v, label, desc]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border p-3 text-left",
            value === v ? "border-primary bg-accent/60" : "hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
              value === v && "border-primary",
            )}
          >
            {value === v && <span className="size-2 rounded-full bg-primary" />}
          </span>
          <span>
            <span className="block text-sm font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Alert rules ---------------- */
const ruleMeta: Record<
  AlertRuleType,
  { title: string; icon: typeof Bell; unit?: string; sentence: (r: AlertRule) => string }
> = {
  "low-balance": {
    title: "Low balance",
    icon: Wallet,
    unit: "credits",
    sentence: (r) =>
      `Notify ${names(r.recipients) || "no one"} when the credit balance drops below ${r.value.toLocaleString()} credits.`,
  },
  spike: {
    title: "Usage spike",
    icon: TrendingUp,
    unit: "% above 7d avg",
    sentence: (r) =>
      `Notify ${names(r.recipients) || "no one"} when daily spend is ${r.value}% above the 7-day average.`,
  },
  budget: {
    title: "Budget threshold",
    icon: Bell,
    unit: "% of budget",
    sentence: (r) =>
      `Notify ${names(r.recipients) || "no one"} when any budget reaches ${r.value}% of its limit.`,
  },
  "new-key": {
    title: "New key created",
    icon: KeyRound,
    sentence: (r) =>
      `Notify ${names(r.recipients) || "no one"} whenever someone creates an API key.`,
  },
  "failed-payment": {
    title: "Failed payment",
    icon: CreditCard,
    sentence: (r) =>
      `Notify ${names(r.recipients) || "no one"} immediately if a payment or auto-recharge fails.`,
  },
};
const channelLabels: Record<Channel, string> = {
  "in-app": "In-app",
  email: "Email",
  slack: "Slack",
  webhook: "Webhook",
};

export function AlertRulesSection() {
  const { rules } = useLimitsStore();
  const canEdit = useRole().can("manageLimits");
  return (
    <section className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2.5 font-semibold">
          <IconTile icon={BellRing} tone="violet" size="sm" />
          Alert rules
        </h3>
        <p className="pl-[38px] text-sm text-muted-foreground">
          What we watch for, and who hears about it.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rules.map((r) => {
          const m = ruleMeta[r.type],
            Icon = m.icon;
          return (
            <div key={r.type} className={cn("surface p-5", !r.enabled && "opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <p className="font-medium">{m.title}</p>
                </div>
                <Switch
                  checked={r.enabled}
                  disabled={!canEdit}
                  onCheckedChange={(enabled) => limitActions.updateRule(r.type, { enabled })}
                  aria-label={`Enable ${m.title}`}
                />
              </div>
              <p className="mt-3 text-sm">{m.sentence(r)}</p>
              {m.unit && (
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={r.type === "budget" ? 100 : undefined}
                    disabled={!canEdit}
                    className="h-8 w-28"
                    value={r.value}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (Number.isFinite(v) && v >= 1 && (r.type !== "budget" || v <= 100))
                        limitActions.updateRule(r.type, { value: v });
                    }}
                    aria-label={`${m.title} value`}
                  />
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(Object.keys(channelLabels) as Channel[]).map((c) => {
                  const on = r.channels.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!canEdit}
                      aria-pressed={on}
                      onClick={() =>
                        limitActions.updateRule(r.type, {
                          channels: on ? r.channels.filter((x) => x !== c) : [...r.channels, c],
                        })
                      }
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60",
                        on
                          ? "border-primary bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {channelLabels[c]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Recipients:</span>
                {teamMembers.map((u) => {
                  const on = r.recipients.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={!canEdit}
                      title={u.name}
                      aria-pressed={on}
                      aria-label={`${on ? "Remove" : "Add"} ${u.name}`}
                      onClick={() =>
                        limitActions.updateRule(r.type, {
                          recipients: on
                            ? r.recipients.filter((x) => x !== u.id)
                            : [...r.recipients, u.id],
                        })
                      }
                      className={cn(
                        "grid size-7 place-items-center rounded-full border text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-60",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {u.initials}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- History ---------------- */
type HistoryRow = (typeof alertHistory)[number];
export function AlertHistorySection() {
  const canEdit = useRole().can("manageLimits");
  const { statuses } = useLimitsStore();
  const statusOf = (id: string): AlertStatus => statuses[id] ?? "resolved";
  const tone: Record<AlertStatus, "critical" | "warning" | "neutral" | "healthy"> = {
    open: "critical",
    acknowledged: "warning",
    resolved: "healthy",
  };
  const columns: Column<HistoryRow>[] = [
    {
      key: "time",
      label: "Time",
      sortValue: (r) => r.date,
      render: (r) => <span className="text-muted-foreground">{fmtDate(r.date)}</span>,
    },
    {
      key: "alert",
      label: "Alert",
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.rule}</p>
        </div>
      ),
    },
    {
      key: "sev",
      label: "Severity",
      sortValue: (r) => r.severity,
      render: (r) => (
        <StatusBadge status={r.severity}>
          {r.severity === "healthy" ? "Info" : r.severity === "warning" ? "Warning" : "Critical"}
        </StatusBadge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortValue: (r) => statusOf(r.id),
      render: (r) => (
        <StatusBadge
          status={
            tone[statusOf(r.id)] === "healthy"
              ? "neutral"
              : (tone[statusOf(r.id)] as "critical" | "warning")
          }
        >
          {statusOf(r.id)[0]?.toUpperCase() + statusOf(r.id).slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (r) =>
        r.source.to === "/projects" ? (
          <Link
            className="text-primary-ink hover:underline"
            to="/projects"
            search={"project" in r.source && r.source.project ? { project: r.source.project } : {}}
          >
            {r.source.label}
          </Link>
        ) : r.source.to === "/usage" ? (
          <Link
            className="text-primary-ink hover:underline"
            to="/usage"
            search={{
              model: undefined,
              project: undefined,
              key: "key_1",
              user: undefined,
              token: undefined,
              from: "2026-09-12",
              to: "2026-09-24",
              action: "inspect-spike",
            }}
          >
            {r.source.label}
          </Link>
        ) : (
          <Link className="text-primary-ink hover:underline" to="/billing">
            {r.source.label}
          </Link>
        ),
    },
    {
      key: "act",
      label: "",
      render: (r) =>
        statusOf(r.id) === "open" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!canEdit}
            onClick={() => {
              limitActions.setStatus(r.id, "acknowledged");
              toast.success("Alert acknowledged");
            }}
          >
            Acknowledge
          </Button>
        ) : statusOf(r.id) === "acknowledged" ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={!canEdit}
            onClick={() => {
              limitActions.setStatus(r.id, "resolved");
              toast.success("Alert resolved");
            }}
          >
            Resolve
          </Button>
        ) : null,
    },
  ];
  return (
    <section className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2.5 font-semibold">
          <IconTile icon={CalendarClock} tone="rose" size="sm" />
          Alert history
        </h3>
        <p className="pl-[38px] text-sm text-muted-foreground">
          {alertHistory.filter((a) => statusOf(a.id) === "open").length} open
        </p>
      </div>
      <DataTable rows={alertHistory} columns={columns} />
    </section>
  );
}
