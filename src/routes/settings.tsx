import { PageHeader } from "@/components/tokenly/primitives";
import { pages } from "@/components/tokenly/nav";
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
      <PageHeader
        icon={pages.settings.icon}
        tone={pages.settings.tone}
        title={pages.settings.label}
        description={pages.settings.description}
      />
      <SettingsView />
    </div>
  );
}
