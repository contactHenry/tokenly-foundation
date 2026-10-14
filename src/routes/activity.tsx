import { PageHeader } from "@/components/tokenly/primitives";
import { pages } from "@/components/tokenly/nav";
import { createFileRoute } from "@tanstack/react-router";
import { useDateRange } from "@/components/tokenly/app-shell";
import { ActivityView } from "@/components/tokenly/activity-view";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity · Tokenly" },
      {
        name: "description",
        content: "Audit log of top-ups, budgets, API keys, alerts and team changes.",
      },
      { property: "og:title", content: "Activity · Tokenly" },
      {
        property: "og:description",
        content: "Audit log of top-ups, budgets, API keys, alerts and team changes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const range = useDateRange();
  return (
    <div className="space-y-8">
      <PageHeader
        icon={pages.activity.icon}
        tone={pages.activity.tone}
        title={pages.activity.label}
        description={pages.activity.description}
      />
      <ActivityView from={range.from} to={range.to} />
    </div>
  );
}
