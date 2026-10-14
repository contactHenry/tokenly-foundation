import { useSyncExternalStore } from "react";
import { restoreState } from "@/components/tokenly/storage";
import { guarded } from "@/components/tokenly/workspace-store";
import { creditAccount, invoices, usageEvents } from "@/lib/mock";

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};
export type InvoiceStatus = "paid" | "due" | "failed";
export type LedgerType = "top-up" | "usage" | "refund" | "bonus";
export type LedgerEntry = {
  id: string;
  date: string;
  type: LedgerType;
  description: string;
  amount: number;
};
type State = {
  balance: number;
  autoRecharge: { enabled: boolean; threshold: number; amount: number; monthlyCap: number };
  methods: PaymentMethod[];
  invoiceStatus: Record<string, InvoiceStatus>;
  extraLedger: LedgerEntry[];
};

export const LAST_DAY = "2026-09-26";
export const USD_PER_CREDIT = creditAccount.usdPerCredit;
export const PLAN = { name: "Growth", price: 499, includedCredits: 30000 };
export const BONUS_TIERS = [
  { min: 1000, pct: 15 },
  { min: 500, pct: 10 },
  { min: 200, pct: 5 },
];
export const bonusPct = (usd: number) => BONUS_TIERS.find((t) => usd >= t.min)?.pct ?? 0;
export const creditsFor = (usd: number) => Math.round(usd / USD_PER_CREDIT);

const seed = (): State => ({
  balance: creditAccount.balance,
  autoRecharge: { enabled: false, threshold: 5000, amount: 12500, monthlyCap: 1000 },
  methods: [
    { id: "pm_1", brand: "Visa", last4: "4242", expiry: "08/28", isDefault: true },
    { id: "pm_2", brand: "Mastercard", last4: "5100", expiry: "02/27", isDefault: false },
  ],
  invoiceStatus: Object.fromEntries(
    invoices.map((inv, i) => [inv.id, i === 0 ? "failed" : i === 1 ? "due" : "paid"]),
  ) as Record<string, InvoiceStatus>,
  extraLedger: [],
});
const KEY = "tokenly-billing-v1";
let state = seed();
let loaded = false;
const server = seed();
const listeners = new Set<() => void>();
function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
export function useBillingStore() {
  return useSyncExternalStore(
    (cb) => {
      if (!loaded) {
        loaded = true;
        try {
          const r = localStorage.getItem(KEY);
          state = restoreState(r, seed());
        } catch {
          /* seed */
        }
      }
      listeners.add(cb);
      cb();
      return () => listeners.delete(cb);
    },
    () => state,
    () => server,
  );
}

export const billingActions = guarded(
  {
    topUp(usd: number, methodLabel: string) {
      const base = creditsFor(usd),
        bonus = Math.round((base * bonusPct(usd)) / 100),
        stamp = Date.now().toString(36);
      const entries: LedgerEntry[] = [
        {
          id: `tu_${stamp}`,
          date: LAST_DAY,
          type: "top-up",
          description: `Top-up · ${methodLabel}`,
          amount: base,
        },
      ];
      if (bonus)
        entries.push({
          id: `bn_${stamp}`,
          date: LAST_DAY,
          type: "bonus",
          description: `${bonusPct(usd)}% top-up bonus`,
          amount: bonus,
        });
      set({
        ...state,
        balance: state.balance + base + bonus,
        extraLedger: [...state.extraLedger, ...entries],
      });
    },
    setAutoRecharge(patch: Partial<State["autoRecharge"]>) {
      // Never charge without a card on file.
      if (patch.enabled && state.methods.length === 0) return;
      set({ ...state, autoRecharge: { ...state.autoRecharge, ...patch } });
    },
    addMethod(m: Omit<PaymentMethod, "id" | "isDefault">) {
      set({
        ...state,
        methods: [
          ...state.methods,
          { ...m, id: `pm_${Date.now().toString(36)}`, isDefault: state.methods.length === 0 },
        ],
      });
    },
    removeMethod(id: string) {
      const rest = state.methods.filter((m) => m.id !== id);
      if (rest.length && !rest.some((m) => m.isDefault)) rest[0] = { ...rest[0]!, isDefault: true };
      const autoRecharge = rest.length
        ? state.autoRecharge
        : { ...state.autoRecharge, enabled: false };
      set({ ...state, methods: rest, autoRecharge });
    },
    makeDefault(id: string) {
      set({ ...state, methods: state.methods.map((m) => ({ ...m, isDefault: m.id === id })) });
    },
    payInvoice(id: string) {
      set({ ...state, invoiceStatus: { ...state.invoiceStatus, [id]: "paid" } });
    },
  },
  {
    topUp: "manageBilling",
    setAutoRecharge: "manageBilling",
    addMethod: "manageBilling",
    removeMethod: "manageBilling",
    makeDefault: "manageBilling",
    payInvoice: "manageBilling",
  },
);

export const shift = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
/** Average credits used per day over the last 7 fixture days. */
export function burnPerDay() {
  const from = shift(LAST_DAY, -6);
  return (
    usageEvents.filter((e) => e.date >= from).reduce((s, e) => s + e.cost, 0) / 7 / USD_PER_CREDIT
  );
}
export const runwayDays = (balance: number) => {
  const b = burnPerDay();
  return b > 0 ? Math.floor(balance / b) : Infinity;
};

/** Seed ledger (oldest→newest) whose running balance ends at the mock balance. */
export function buildLedger(extra: LedgerEntry[], currentBalance: number) {
  const from = shift(LAST_DAY, -29);
  const daily = new Map<string, number>();
  for (const e of usageEvents)
    if (e.date >= from) daily.set(e.date, (daily.get(e.date) ?? 0) + e.cost);
  const base: LedgerEntry[] = [...daily.entries()].map(([date, cost]) => ({
    id: `use_${date}`,
    date,
    type: "usage" as const,
    description: "Daily usage",
    amount: -Math.round(cost / USD_PER_CREDIT),
  }));
  for (const t of creditAccount.topUps)
    if (t.date >= from) {
      base.push({
        id: t.id,
        date: t.date,
        type: "top-up",
        description: `Top-up · ${t.method}`,
        amount: t.amount,
      });
      base.push({
        id: `${t.id}_b`,
        date: t.date,
        type: "bonus",
        description: "10% top-up bonus",
        amount: Math.round(t.amount * 0.1),
      });
    }
  base.push({
    id: "ref_01",
    date: "2026-09-19",
    type: "refund",
    description: "Refund · Sep 18 duplicate requests",
    amount: 1200,
  });
  base.push({
    id: "bn_plan",
    date: "2026-09-01",
    type: "bonus",
    description: "Growth plan monthly credits",
    amount: PLAN.includedCredits,
  });
  const order: Record<LedgerType, number> = { "top-up": 0, bonus: 1, refund: 2, usage: 3 };
  const all = [...base, ...extra].sort(
    (a, b) => a.date.localeCompare(b.date) || order[a.type] - order[b.type],
  );
  const total = all.reduce((s, e) => s + e.amount, 0);
  let running = currentBalance - total;
  return all
    .map((e) => {
      running += e.amount;
      return { ...e, balance: running };
    })
    .reverse();
}
