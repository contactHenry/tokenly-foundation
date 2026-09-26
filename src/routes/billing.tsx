import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AutoRechargeCard, BalanceCard, InvoicesSection, LedgerSection, PaymentMethodsCard, PlanCard, TopUpDialog } from "@/components/tokenly/billing-view";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing · Tokenly" }, { name: "description", content: "Credit balance, top-ups, auto-recharge, plan pricing, invoices and credit ledger." }, { property: "og:title", content: "Billing · Tokenly" }, { property: "og:description", content: "Credit balance, top-ups, auto-recharge, plan pricing, invoices and credit ledger." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const [topUp, setTopUp] = useState(false);
  return <div className="space-y-10">
    <div><p className="text-sm text-muted-foreground">Workspace / Billing</p><h2 className="mt-2 text-2xl font-semibold">Billing</h2></div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12"><BalanceCard onTopUp={() => setTopUp(true)} /><AutoRechargeCard /><PlanCard /><PaymentMethodsCard /></div>
    <InvoicesSection />
    <LedgerSection />
    <TopUpDialog open={topUp} onOpenChange={setTopUp} />
  </div>;
}
