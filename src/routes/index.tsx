import { PageHeader } from "@/components/tokenly/primitives";
import { pages } from "@/components/tokenly/nav";
import { useBillingStore } from "@/components/tokenly/billing-store";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { OnboardingChecklist } from "@/components/tokenly/onboarding";
import { useDateRange } from "@/components/tokenly/app-shell";
import {
  getOverviewData,
  NeedsAttention,
  OverviewSkeleton,
  RecentActivity,
  SpendTrend,
  StatusRow,
  TopConsumers,
} from "@/components/tokenly/overview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · Tokenly" },
      {
        name: "description",
        content: "See credit runway, spending drivers, alerts and recent activity in Tokenly.",
      },
      { property: "og:title", content: "Overview · Tokenly" },
      {
        property: "og:description",
        content: "See credit runway, spending drivers, alerts and recent activity in Tokenly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});
function Overview() {
  const range = useDateRange();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const { balance } = useBillingStore();
  const data = getOverviewData(range, balance);
  if (!ready) return <OverviewSkeleton />;
  return (
    <div className="space-y-5">
      <div className="mb-3">
        <PageHeader
          icon={pages.overview.icon}
          tone={pages.overview.tone}
          title={pages.overview.label}
          description={pages.overview.description}
          actions={
            <span className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Data through Sep 26, 2026
            </span>
          }
        />
      </div>
      <OnboardingChecklist />
      <StatusRow data={data} />
      <NeedsAttention data={data} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <SpendTrend data={data} range={range} />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <TopConsumers data={data} range={range} />
        </div>
      </div>
      <RecentActivity range={range} />
    </div>
  );
}
