import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/tokenly/settings-view";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Tokenly" },
      {
        name: "description",
        content:
          "Workspace details, team roles and permissions, notification preferences and integrations.",
      },
      { property: "og:title", content: "Settings · Tokenly" },
      {
        property: "og:description",
        content:
          "Workspace details, team roles and permissions, notification preferences and integrations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <SettingsView />
    </div>
  );
}
