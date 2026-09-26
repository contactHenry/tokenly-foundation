import { createFileRoute } from "@tanstack/react-router";
import { useDateRange } from "@/components/tokenly/app-shell";
import { ActivityView } from "@/components/tokenly/activity-view";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity · Tokenly" }, { name: "description", content: "Audit log of top-ups, budgets, API keys, alerts and team changes." }, { property: "og:title", content: "Activity · Tokenly" }, { property: "og:description", content: "Audit log of top-ups, budgets, API keys, alerts and team changes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const range = useDateRange();
  return <div className="space-y-8"><div><p className="text-sm text-muted-foreground">Workspace / Activity</p><h2 className="mt-2 text-2xl font-semibold">Activity</h2><p className="mt-1 text-sm text-muted-foreground">Who did what, and when. Follows the date range at the top.</p></div><ActivityView from={range.from} to={range.to} /></div>;
}
