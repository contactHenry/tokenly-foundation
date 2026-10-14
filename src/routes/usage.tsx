import { createFileRoute } from "@tanstack/react-router";
import { UsageView } from "@/components/tokenly/usage-view";
const field = (search: Record<string, unknown>, key: string) =>
  typeof search[key] === "string" && search[key] ? String(search[key]).slice(0, 100) : undefined;
// Hand-edited or stale links must not crash the page, so only real YYYY-MM-DD dates survive.
const dateField = (search: Record<string, unknown>, key: string) => {
  const value = field(search, key);
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    ? value
    : undefined;
};
const tokenField = (search: Record<string, unknown>) => {
  const value = field(search, "token");
  return value === "input" || value === "output" ? value : undefined;
};
export const Route = createFileRoute("/usage")({
  validateSearch: (search: Record<string, unknown>) => {
    let from = dateField(search, "from"),
      to = dateField(search, "to");
    if (from && to && from > to) [from, to] = [to, from];
    return {
      model: field(search, "model"),
      project: field(search, "project"),
      key: field(search, "key"),
      user: field(search, "user"),
      token: tokenField(search),
      from,
      to,
      action: field(search, "action"),
    };
  },
  head: () => ({
    meta: [
      { title: "Usage · Tokenly" },
      { name: "description", content: "Analyze AI token usage by model, project, key and user." },
      { property: "og:title", content: "Usage · Tokenly" },
      {
        property: "og:description",
        content: "Analyze AI token usage by model, project, key and user.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsageView,
});
