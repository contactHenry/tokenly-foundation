import { createFileRoute } from "@tanstack/react-router";
import { UsageView } from "@/components/tokenly/usage-view";
const field = (search: Record<string, unknown>, key: string) =>
  typeof search[key] === "string" ? String(search[key]) : undefined;
export const Route = createFileRoute("/usage")({
  validateSearch: (search: Record<string, unknown>) => ({
    model: field(search, "model"),
    project: field(search, "project"),
    key: field(search, "key"),
    user: field(search, "user"),
    token: field(search, "token"),
    from: field(search, "from"),
    to: field(search, "to"),
    action: field(search, "action"),
  }),
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
