import { createFileRoute } from "@tanstack/react-router";
import { AlertHistorySection, AlertRulesSection, BudgetsSection } from "@/components/tokenly/limits-view";

export const Route = createFileRoute("/limits")({
  validateSearch: (search: Record<string, unknown>) => ({ project: typeof search["project"] === "string" ? search["project"] : undefined, action: typeof search["action"] === "string" ? search["action"] : undefined }),
  head: () => ({ meta: [{ title: "Limits & Alerts · Tokenly" }, { name: "description", content: "Set budgets, spending limits and alert rules to prevent AI overspend." }, { property: "og:title", content: "Limits & Alerts · Tokenly" }, { property: "og:description", content: "Set budgets, spending limits and alert rules to prevent AI overspend." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return <div className="space-y-10">
    <div><p className="text-sm text-muted-foreground">Workspace / Limits & Alerts</p><h2 className="mt-2 text-2xl font-semibold">Limits & Alerts</h2><p className="mt-1 text-sm text-muted-foreground">Catch overspend before it happens.</p></div>
    <BudgetsSection {...(search.action === "adjust-limit" && search.project ? { focusProject: search.project } : {})} />
    <AlertRulesSection />
    <AlertHistorySection />
  </div>;
}
