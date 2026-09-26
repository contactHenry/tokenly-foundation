import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { OnboardingChecklist } from "@/components/tokenly/onboarding";
import { useDateRange } from "@/components/tokenly/app-shell";
import { getOverviewData, NeedsAttention, OverviewSkeleton, RecentActivity, SpendTrend, StatusRow, TopConsumers } from "@/components/tokenly/overview";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview · Tokenly" }, { name: "description", content: "See credit runway, spending drivers, alerts and recent activity in Tokenly." }, { property: "og:title", content: "Overview · Tokenly" }, { property: "og:description", content: "See credit runway, spending drivers, alerts and recent activity in Tokenly." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Overview,
});
function Overview() {
  const range = useDateRange();
  const [ready, setReady] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(frame); }, []);
  const data = getOverviewData(range);
  if (!ready) return <OverviewSkeleton />;
  return <div className="space-y-5"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Workspace overview <span className="mx-1">/</span> {range.label === "Custom" ? "Custom range" : range.label === "Today" ? "Today" : `Last ${range.label}`}</p><h2 className="mt-2 text-2xl font-semibold sm:text-[28px]">Credit overview</h2><p className="mt-2 text-sm text-muted-foreground">Your balance, runway, and what’s driving spend.</p></div><span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" />Usage data through Sep 26, 2026</span></div><OnboardingChecklist /><StatusRow data={data} /><NeedsAttention data={data} /><div className="grid grid-cols-1 gap-5 lg:grid-cols-12"><div className="min-w-0 lg:col-span-8"><SpendTrend data={data} range={range} /></div><div className="min-w-0 lg:col-span-4"><TopConsumers data={data} range={range} /></div></div><RecentActivity range={range} /></div>;
}
