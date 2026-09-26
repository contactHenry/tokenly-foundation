import { useSyncExternalStore } from "react";
import { alerts, apiKeys, budgets, projects, usageEvents } from "@/lib/mock";

export type Scope = "org" | "project" | "key";
export type Period = "daily" | "weekly" | "monthly";
export type LimitAction = "notify" | "throttle" | "stop";
export type Channel = "in-app" | "email" | "slack" | "webhook";
export type BudgetRule = { id: string; scope: Scope; targetId: string; amount: number; period: Period; thresholds: number[]; action: LimitAction; recipients: string[] };
export type AlertRuleType = "low-balance" | "spike" | "budget" | "new-key" | "failed-payment";
export type AlertRule = { type: AlertRuleType; enabled: boolean; value: number; channels: Channel[]; recipients: string[] };
export type AlertStatus = "open" | "acknowledged" | "resolved";
type State = { budgets: BudgetRule[]; rules: AlertRule[]; statuses: Record<string, AlertStatus> };

export const LAST_DAY = "2026-09-26";
const seed = (): State => ({
  budgets: [
    { id: "bud_org", scope: "org", targetId: "org_01", amount: 3000, period: "monthly", thresholds: [50, 80, 100], action: "notify", recipients: ["usr_01", "usr_02"] },
    ...budgets.map((b, i) => ({ id: `bud_${b.projectId}`, scope: "project" as const, targetId: b.projectId, amount: b.monthlyLimit, period: "monthly" as const, thresholds: [50, 80, 100], action: (["throttle", "notify", "stop", "notify"] as const)[i] ?? "notify", recipients: ["usr_01"] })),
    { id: "bud_key1", scope: "key", targetId: "key_1", amount: 80, period: "weekly", thresholds: [50, 80, 100], action: "throttle", recipients: ["usr_01", "usr_03"] },
  ],
  rules: [
    { type: "low-balance", enabled: true, value: 5000, channels: ["in-app", "email"], recipients: ["usr_01", "usr_02"] },
    { type: "spike", enabled: true, value: 150, channels: ["in-app", "slack"], recipients: ["usr_01", "usr_03"] },
    { type: "budget", enabled: true, value: 80, channels: ["in-app", "email"], recipients: ["usr_01"] },
    { type: "new-key", enabled: false, value: 0, channels: ["email"], recipients: ["usr_02"] },
    { type: "failed-payment", enabled: true, value: 0, channels: ["in-app", "email", "webhook"], recipients: ["usr_01"] },
  ],
  statuses: { alt_01: "open", alt_02: "acknowledged", alt_03: "resolved", alt_04: "resolved", alt_05: "resolved" },
});

const KEY = "tokenly-limits-v1";
let state = seed(); let loaded = false; const server = seed();
const listeners = new Set<() => void>();
function set(next: State) { state = next; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } listeners.forEach(l => l()); }
export function useLimitsStore() {
  return useSyncExternalStore(cb => { if (!loaded) { loaded = true; try { const r = localStorage.getItem(KEY); if (r) state = JSON.parse(r) as State; } catch { /* seed */ } } listeners.add(cb); cb(); return () => listeners.delete(cb); }, () => state, () => server);
}
export const limitActions = {
  saveBudget(b: BudgetRule) { set({ ...state, budgets: state.budgets.some(x => x.id === b.id) ? state.budgets.map(x => x.id === b.id ? b : x) : [...state.budgets, b] }); },
  deleteBudget(id: string) { set({ ...state, budgets: state.budgets.filter(b => b.id !== id) }); },
  updateRule(type: AlertRuleType, patch: Partial<AlertRule>) { set({ ...state, rules: state.rules.map(r => r.type === type ? { ...r, ...patch } : r) }); },
  setStatus(id: string, status: AlertStatus) { set({ ...state, statuses: { ...state.statuses, [id]: status } }); },
};

export const shift = (date: string, days: number) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
export const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const match = (scope: Scope, id: string) => (e: (typeof usageEvents)[number]) => scope === "org" || (scope === "project" ? e.projectId === id : e.keyId === id);
export function periodStart(p: Period) { return p === "monthly" ? "2026-09-01" : p === "weekly" ? shift(LAST_DAY, -6) : LAST_DAY; }
export function periodEnd(p: Period) { return p === "monthly" ? "2026-09-30" : p === "weekly" ? LAST_DAY : LAST_DAY; }
export function budgetSpend(b: Pick<BudgetRule, "scope" | "targetId" | "period">) {
  if (b.scope === "project" && b.period === "monthly") { const m = budgets.find(x => x.projectId === b.targetId); if (m) return m.spent; }
  const from = periodStart(b.period), f = match(b.scope, b.targetId);
  return usageEvents.filter(e => e.date >= from && e.date <= LAST_DAY && f(e)).reduce((s, e) => s + e.cost, 0) * (b.scope === "org" && b.period === "monthly" ? 1.9 : 1);
}
export function dailyBurn(scope: Scope, id: string) { const from = shift(LAST_DAY, -6), f = match(scope, id); return usageEvents.filter(e => e.date >= from && f(e)).reduce((s, e) => s + e.cost, 0) / 7; }
/** Projected date the limit is reached at the current 7-day burn rate. */
export function projectHit(b: Pick<BudgetRule, "scope" | "targetId" | "period" | "amount">) {
  const spent = budgetSpend(b), burn = dailyBurn(b.scope, b.targetId) * (b.scope === "org" && b.period === "monthly" ? 1.9 : 1);
  if (spent >= b.amount) return { reached: true as const, date: LAST_DAY };
  if (burn <= 0) return null;
  const days = Math.ceil((b.amount - spent) / burn);
  // Weekly/daily windows roll, so project on a full-period basis.
  const date = shift(LAST_DAY, days);
  return { reached: false as const, date, withinPeriod: b.period === "monthly" ? date <= periodEnd("monthly") : days <= 0 };
}
export function scopeName(scope: Scope, id: string, extraProjects: { id: string; name: string }[] = []) {
  if (scope === "org") return "Acme Studio (organization)";
  if (scope === "project") return [...projects, ...extraProjects].find(p => p.id === id)?.name ?? "Unknown project";
  return apiKeys.find(k => k.id === id)?.name ?? "Unknown key";
}
export const alertHistory = [
  ...alerts.map(a => ({ id: a.id, date: a.date, rule: a.id === "alt_02" ? "Usage spike" : a.id === "alt_01" ? "Budget threshold" : "Low balance", title: a.title, severity: a.severity, source: a.id === "alt_02" ? { to: "/usage" as const, label: "Production API usage" } : a.id === "alt_01" ? { to: "/projects" as const, label: "Research Lab", project: "prj_03" } : { to: "/billing" as const, label: "Credit balance" } })),
  { id: "alt_06", date: "2026-09-12", rule: "New key created", title: "Key “Support Copilot · Test” created", severity: "healthy" as const, source: { to: "/projects" as const, label: "Support Copilot", project: "prj_02" } },
  { id: "alt_07", date: "2026-08-02", rule: "Failed payment", title: "Card payment declined", severity: "critical" as const, source: { to: "/billing" as const, label: "Invoice INV-2026-008" } },
].sort((a, b) => b.date.localeCompare(a.date));
