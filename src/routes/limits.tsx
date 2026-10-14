import { PageHeader } from "@/components/tokenly/primitives";
import { pages } from "@/components/tokenly/nav";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertHistorySection,
  AlertRulesSection,
  BudgetsSection,
} from "@/components/tokenly/limits-view";

export const Route = createFileRoute("/limits")({
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search["project"] === "string" ? search["project"] : undefined,
    action: typeof search["action"] === "string" ? search["action"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Limits & Alerts · Tokenly" },
      {
        name: "description",
        content: "Set budgets, spending limits and alert rules to prevent AI overspend.",
      },
      { property: "og:title", content: "Limits & Alerts · Tokenly" },
      {
        property: "og:description",
        content: "Set budgets, spending limits and alert rules to prevent AI overspend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <div className="space-y-10">
      <PageHeader
        title={pages.limits.label}
        description={pages.limits.description}
      />
      <BudgetsSection
        {...(search.action === "adjust-limit" && search.project
          ? { focusProject: search.project }
          : {})}
      />
      <AlertRulesSection />
      <AlertHistorySection />
    </div>
  );
}
