import { toast } from "sonner";
import { Gate } from "./role-gate";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, CreditCard, Download, Gift, Plus, RotateCcw, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertBanner, DataTable, StatusBadge, type Column } from "@/components/tokenly/primitives";
import { invoices, models } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { BONUS_TIERS, PLAN, USD_PER_CREDIT, billingActions, bonusPct, buildLedger, burnPerDay, creditsFor, fmtDate, runwayDays, shift, LAST_DAY, useBillingStore, type InvoiceStatus, type LedgerEntry } from "./billing-store";

const money = (v: number, d = 0) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });
const num = (v: number) => Math.round(v).toLocaleString("en-US");
const runwayText = (days: number) => (Number.isFinite(days) ? `${days} days` : "No recent usage");
const runwayTone = (days: number) => (days < 7 ? "critical" : days < 14 ? "warning" : "healthy") as "critical" | "warning" | "healthy";

/* ---------- Balance ---------- */
export function BalanceCard({ onTopUp }: { onTopUp: () => void }) {
  const { balance } = useBillingStore();
  const days = runwayDays(balance), burn = burnPerDay();
  return <div className="rounded-xl border bg-card p-6 lg:col-span-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Credit balance</p><p className="mt-1 text-4xl font-semibold tracking-tight">{num(balance)}<span className="ml-2 text-base font-normal text-muted-foreground">credits</span></p><p className="mt-1 text-sm text-muted-foreground">≈ {money(balance * USD_PER_CREDIT)} at {money(USD_PER_CREDIT, 3)} per credit</p></div><Gate perm="manageBilling" disabled={<Button size="lg" disabled><Plus className="size-4" />Top up</Button>}><Button size="lg" onClick={onTopUp}><Plus className="size-4" />Top up</Button></Gate></div>
    <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5"><div><p className="text-xs text-muted-foreground">Runway</p><div className="mt-1 flex items-center gap-2"><p className="text-lg font-semibold">{runwayText(days)}</p><StatusBadge status={runwayTone(days)}>{runwayTone(days) === "healthy" ? "Healthy" : runwayTone(days) === "warning" ? "Under 14 days" : "Under 7 days"}</StatusBadge></div>{Number.isFinite(days) && <p className="text-xs text-muted-foreground">Runs out around {fmtDate(shift(LAST_DAY, days))}</p>}</div><div><p className="text-xs text-muted-foreground">Burn rate</p><p className="mt-1 text-lg font-semibold">{num(burn)} <span className="text-sm font-normal text-muted-foreground">credits/day</span></p><p className="text-xs text-muted-foreground">7-day average</p></div></div>
  </div>;
}

/* ---------- Top-up ---------- */
const presets = [50, 200, 500];
export function TopUpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { balance, methods } = useBillingStore();
  const [preset, setPreset] = useState<number | "custom">(200), [custom, setCustom] = useState(""), [methodId, setMethodId] = useState(""), [done, setDone] = useState<{ before: number; added: number } | null>(null), [error, setError] = useState("");
  const usd = preset === "custom" ? Number(custom) : preset;
  const base = Number.isFinite(usd) && usd > 0 ? creditsFor(usd) : 0, bonus = Math.round(base * bonusPct(usd) / 100);
  const method = methods.find(m => m.id === methodId) ?? methods.find(m => m.isDefault) ?? methods[0];
  const close = () => { onOpenChange(false); setTimeout(() => { setDone(null); setError(""); setPreset(200); setCustom(""); }, 200); };
  const confirm = () => {
    if (!Number.isFinite(usd) || usd < 10 || usd > 50000) return setError("Enter an amount between $10 and $50,000.");
    if (!method) return setError("Add a payment method first.");
    billingActions.topUp(usd, `${method.brand} •••• ${method.last4}`); setDone({ before: balance, added: base + bonus }); toast.success(`${num(base + bonus)} credits added`);
  };
  return <Dialog open={open} onOpenChange={v => { if (!v) close(); }}><DialogContent className="sm:max-w-lg">{done ? <>
    <DialogHeader><div className="mb-2 grid size-10 place-items-center rounded-full bg-success-muted"><Check className="size-5 text-success" /></div><DialogTitle>Credits added</DialogTitle><DialogDescription>{num(done.added)} credits are available now.</DialogDescription></DialogHeader>
    <div className="grid grid-cols-2 gap-3"><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">New balance</p><p className="mt-1 text-2xl font-semibold">{num(done.before + done.added)}</p><p className="text-xs text-muted-foreground">was {num(done.before)}</p></div><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">New runway</p><p className="mt-1 text-2xl font-semibold">{runwayText(runwayDays(done.before + done.added))}</p><p className="text-xs text-muted-foreground">was {runwayText(runwayDays(done.before))}</p></div></div>
    <p className="text-xs text-muted-foreground">Preview only — no payment was taken.</p>
    <DialogFooter><Button onClick={close}>Done</Button></DialogFooter></> : <>
    <DialogHeader><DialogTitle>Top up credits</DialogTitle><DialogDescription>Bigger top-ups earn bonus credits.</DialogDescription></DialogHeader>
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">{[...presets, "custom" as const].map(p => { const on = preset === p, pct = typeof p === "number" ? bonusPct(p) : 0; return <button key={p} type="button" aria-pressed={on} onClick={() => setPreset(p)} className={cn("rounded-lg border px-2 py-3 text-center", on ? "border-primary bg-accent" : "hover:bg-muted")}><span className="block font-semibold">{p === "custom" ? "Custom" : money(p)}</span><span className={cn("block text-[11px]", pct ? "text-success" : "text-muted-foreground")}>{p === "custom" ? "Any amount" : pct ? `+${pct}% bonus` : "No bonus"}</span></button>; })}</div>
      {preset === "custom" && <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Amount (USD)</Label><Input type="number" min={10} value={custom} onChange={e => setCustom(e.target.value)} placeholder="e.g. 1000" autoFocus aria-label="Custom amount" /></div>}
      <div className="flex flex-wrap gap-2 text-xs">{[...BONUS_TIERS].reverse().map(t => <span key={t.min} className={cn("rounded-full border px-2.5 py-1", usd >= t.min && bonusPct(usd) === t.pct ? "border-success/40 bg-success-muted text-success" : "text-muted-foreground")}>{money(t.min)}+ → {t.pct}% bonus</span>)}</div>
      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Payment method</Label>{methods.length ? <div className="space-y-2">{methods.map(m => <label key={m.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm", method?.id === m.id && "border-primary")}><input type="radio" name="pm" className="accent-[var(--primary)]" checked={method?.id === m.id} onChange={() => setMethodId(m.id)} /><CreditCard className="size-4 text-muted-foreground" /><span className="flex-1">{m.brand} •••• {m.last4}</span><span className="text-xs text-muted-foreground">{m.expiry}</span></label>)}</div> : <p className="text-sm text-muted-foreground">No saved cards. Add one under Payment methods.</p>}</div>
      <div className="space-y-1.5 rounded-lg bg-muted/50 p-4 text-sm"><p className="flex justify-between"><span className="text-muted-foreground">Credits</span><span>{num(base)}</span></p><p className="flex justify-between"><span className="text-muted-foreground">Bonus</span><span className={bonus ? "text-success" : ""}>+{num(bonus)}</span></p><p className="flex justify-between border-t pt-1.5 font-semibold"><span>You'll receive</span><span>{num(base + bonus)} credits</span></p></div>
      {error && <p className="text-sm text-critical">{error}</p>}
    </div>
    <DialogFooter><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={confirm} disabled={!base}>Pay {base ? money(usd, usd % 1 ? 2 : 0) : ""}</Button></DialogFooter></>}
  </DialogContent></Dialog>;
}

/* ---------- Auto-recharge ---------- */
export function AutoRechargeCard() {
  const { autoRecharge: a } = useBillingStore();
  const cost = a.amount * USD_PER_CREDIT;
  const field = (label: string, value: number, key: "threshold" | "amount" | "monthlyCap", suffix: string) => <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label><div className="flex items-center gap-2"><Input type="number" min={1} className="h-9" value={value} disabled={!a.enabled} onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) billingActions.setAutoRecharge({ [key]: v }); }} aria-label={label} /><span className="shrink-0 text-xs text-muted-foreground">{suffix}</span></div></div>;
  return <div className="rounded-xl border bg-card p-6 lg:col-span-5">
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><Zap className="size-4 text-muted-foreground" /><h3 className="font-semibold">Auto-recharge</h3></div><Switch checked={a.enabled} onCheckedChange={enabled => { billingActions.setAutoRecharge({ enabled }); toast.success(enabled ? "Auto-recharge on" : "Auto-recharge off"); }} aria-label="Enable auto-recharge" /></div>
    <div className="mt-5 grid grid-cols-2 gap-3">{field("When balance falls below", a.threshold, "threshold", "credits")}{field("Add", a.amount, "amount", "credits")}<div className="col-span-2">{field("Monthly cap", a.monthlyCap, "monthlyCap", "USD / month")}</div></div>
    <p className={cn("mt-5 rounded-lg p-3 text-sm", a.enabled ? "bg-accent/60" : "bg-muted/60 text-muted-foreground")}>{a.enabled ? `When your balance drops below ${num(a.threshold)} credits, we'll add ${num(a.amount)} credits (${money(cost)}) to your default card — up to ${money(a.monthlyCap)} per month.` : "Auto-recharge is off. Your API calls will stop if credits run out."}</p>
  </div>;
}

/* ---------- Plan ---------- */
export function PlanCard() {
  return <div className="rounded-xl border bg-card lg:col-span-7">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b p-6"><div><p className="text-sm text-muted-foreground">Current plan</p><p className="mt-1 text-xl font-semibold">{PLAN.name} <span className="text-sm font-normal text-muted-foreground">· {money(PLAN.price)}/month</span></p><p className="mt-1 text-sm text-muted-foreground">Includes {num(PLAN.includedCredits)} credits each month (≈ {money(PLAN.includedCredits * USD_PER_CREDIT)})</p></div><a href="#plans" onClick={e => e.preventDefault()} className="text-sm font-medium text-primary hover:underline">Change plan</a></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[440px] text-sm"><thead className="text-xs text-muted-foreground"><tr className="border-b"><th className="px-6 py-3 text-left font-medium">Model</th><th className="px-6 py-3 text-right font-medium">Input / 1K tokens</th><th className="px-6 py-3 text-right font-medium">Output / 1K tokens</th></tr></thead><tbody>{models.map(m => <tr key={m.id} className="border-b last:border-0"><td className="px-6 py-3"><span className="font-medium">{m.name}</span><span className="ml-2 text-xs text-muted-foreground">{m.provider}</span></td><td className="px-6 py-3 text-right">${(m.inputPerMillion / 1000).toFixed(5)}</td><td className="px-6 py-3 text-right">{m.outputPerMillion ? `$${(m.outputPerMillion / 1000).toFixed(5)}` : "—"}</td></tr>)}</tbody></table></div>
  </div>;
}

/* ---------- Payment methods ---------- */
export function PaymentMethodsCard() {
  const { methods } = useBillingStore();
  const [adding, setAdding] = useState(false), [card, setCard] = useState(""), [exp, setExp] = useState(""), [err, setErr] = useState("");
  const add = () => {
    const digits = card.replace(/\s/g, "");
    if (!/^\d{12,19}$/.test(digits)) return setErr("Enter a valid card number.");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return setErr("Use MM/YY for expiry.");
    billingActions.addMethod({ brand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : digits.startsWith("3") ? "Amex" : "Card", last4: digits.slice(-4), expiry: exp });
    setCard(""); setExp(""); setErr(""); setAdding(false); toast.success("Card added");
  };
  return <div className="rounded-xl border bg-card p-6 lg:col-span-5">
    <div className="flex items-center justify-between"><h3 className="font-semibold">Payment methods</h3><Gate perm="manageBilling" disabled={<Button size="sm" variant="outline" disabled><Plus className="size-3.5" />Add</Button>}><Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="size-3.5" />Add</Button></Gate></div>
    <div className="mt-4 space-y-2">{methods.length ? methods.map(m => <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3"><CreditCard className="size-4 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{m.brand} •••• {m.last4}</p><p className="text-xs text-muted-foreground">Expires {m.expiry}</p></div>{m.isDefault ? <StatusBadge status="neutral">Default</StatusBadge> : <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { billingActions.makeDefault(m.id); toast.success(`${m.brand} •••• ${m.last4} is now default`); }}>Make default</Button>}<Button variant="ghost" size="icon" className="size-7" aria-label={`Remove ${m.brand} ending ${m.last4}`} onClick={() => { billingActions.removeMethod(m.id); toast.success("Card removed"); }}><Trash2 className="size-3.5" /></Button></div>) : <p className="text-sm text-muted-foreground">No payment methods saved.</p>}</div>
    <Dialog open={adding} onOpenChange={setAdding}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Add card</DialogTitle><DialogDescription>Preview only — card details aren't stored beyond the last 4 digits.</DialogDescription></DialogHeader><div className="space-y-3"><div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Card number</Label><Input inputMode="numeric" value={card} onChange={e => setCard(e.target.value.slice(0, 23))} placeholder="4242 4242 4242 4242" autoComplete="off" /></div><div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Expiry</Label><Input value={exp} onChange={e => setExp(e.target.value.slice(0, 5))} placeholder="MM/YY" /></div>{err && <p className="text-sm text-critical">{err}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={add}>Add card</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

/* ---------- Invoices ---------- */
function downloadPdf(number: string, date: string, amount: number, status: string) {
  const lines = ["Tokenly - Acme Studio", `Invoice ${number}`, `Date: ${fmtDate(date)}`, `Amount: ${money(amount, 2)}`, `Status: ${status}`, "Sample invoice generated in preview."];
  const stream = `BT /F1 14 Tf 72 740 Td 20 TL ${lines.map(l => `(${l.replace(/[()\\]/g, "")}) Tj T*`).join(" ")} ET`;
  const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf = "%PDF-1.4\n"; const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })), a = document.createElement("a");
  a.href = url; a.download = `${number}.pdf`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function InvoicesSection() {
  const { invoiceStatus } = useBillingStore();
  const [retrying, setRetrying] = useState(false);
  const rows = invoices.map(i => ({ ...i, st: (invoiceStatus[i.id] ?? "paid") as InvoiceStatus }));
  const failed = rows.find(r => r.st === "failed");
  const tone = { paid: "healthy", due: "warning", failed: "critical" } as const;
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "date", label: "Date", sortValue: r => r.date, render: r => fmtDate(r.date) },
    { key: "num", label: "Number", sortValue: r => r.number, render: r => <span className="font-mono text-xs">{r.number}</span> },
    { key: "amt", label: "Amount", className: "text-right", sortValue: r => r.amount, render: r => money(r.amount, 2) },
    { key: "st", label: "Status", sortValue: r => r.st, render: r => <StatusBadge status={tone[r.st]}>{r.st === "paid" ? "Paid" : r.st === "due" ? "Due" : "Failed"}</StatusBadge> },
    { key: "pdf", label: "", className: "w-12 text-right", render: r => <Button variant="ghost" size="icon" className="size-8" aria-label={`Download ${r.number} PDF`} onClick={() => downloadPdf(r.number, r.date, r.amount, r.st)}><Download className="size-4" /></Button> },
  ];
  const retry = () => { if (!failed) return; setRetrying(true); setTimeout(() => { billingActions.payInvoice(failed.id); setRetrying(false); toast.success(`${failed.number} paid`); }, 700); };
  return <section className="space-y-4"><h3 className="font-semibold">Invoices</h3>
    {failed && <div className="relative"><AlertBanner tone="critical" title={`Payment failed for ${failed.number}`} description={`We couldn't charge ${money(failed.amount, 2)} to your default card. Retry now to avoid service interruption.`} /><Button size="sm" variant="outline" className="absolute right-4 top-1/2 -translate-y-1/2 bg-card" onClick={retry} disabled={retrying}><RotateCcw className={cn("size-3.5", retrying && "animate-spin")} />{retrying ? "Retrying…" : "Retry"}</Button></div>}
    <DataTable rows={rows} columns={columns} />
  </section>;
}

/* ---------- Ledger ---------- */
const ledgerIcon: Record<LedgerEntry["type"], typeof Plus> = { "top-up": ArrowDownLeft, usage: ArrowUpRight, refund: RotateCcw, bonus: Gift };
export function LedgerSection() {
  const { extraLedger, balance } = useBillingStore();
  const [page, setPage] = useState(0);
  const rows = buildLedger(extraLedger, balance), size = 12, pages = Math.ceil(rows.length / size);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "date", label: "Date", render: r => fmtDate(r.date) },
    { key: "desc", label: "Description", render: r => { const I = ledgerIcon[r.type]; return <span className="flex items-center gap-2.5"><span className={cn("grid size-7 place-items-center rounded-full", r.amount > 0 ? "bg-success-muted text-success" : "bg-muted text-muted-foreground")}><I className="size-3.5" /></span><span><span className="block font-medium">{r.description}</span><span className="block text-xs capitalize text-muted-foreground">{r.type}</span></span></span>; } },
    { key: "amt", label: "Credits", className: "text-right", render: r => <span className={r.amount > 0 ? "text-success" : ""}>{r.amount > 0 ? "+" : "−"}{num(Math.abs(r.amount))}</span> },
    { key: "bal", label: "Balance", className: "text-right", render: r => <span className="font-medium">{num(r.balance)}</span> },
  ];
  return <section className="space-y-4"><div><h3 className="font-semibold">Credit transactions</h3><p className="text-sm text-muted-foreground">Usage is rolled up daily. Last 30 days.</p></div><DataTable rows={rows.slice(page * size, page * size + size)} columns={columns} />
    <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Page {page + 1} of {pages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button></div></div></section>;
}
