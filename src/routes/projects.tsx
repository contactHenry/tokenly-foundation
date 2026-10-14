import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tokenly/primitives";
import { KeysTable, ProjectDetail, ProjectsGrid } from "@/components/tokenly/projects-view";
import { useProjectsStore } from "@/components/tokenly/projects-store";

type Search = { project?: string };

export const Route = createFileRoute("/projects")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s["project"] === "string" ? { project: s["project"] } : {},
  head: () => ({
    meta: [
      { title: "Projects & Keys · Tokenly" },
      { name: "description", content: "Manage workspace projects, budgets, and API keys." },
      { property: "og:title", content: "Projects & Keys · Tokenly" },
      { property: "og:description", content: "Manage workspace projects, budgets, and API keys." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const { projects } = useProjectsStore();
  if (search.project) {
    const project = projects.find((p) => p.id === search.project);
    return project ? (
      <ProjectDetail key={project.id} project={project} />
    ) : (
      <EmptyState
        title="Project not found"
        description="It may have been removed."
        action={
          <Button asChild variant="outline">
            <Link to="/projects" search={{}}>
              Back to projects
            </Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Projects & Keys</h1>
      </div>
      <ProjectsGrid />
      <KeysTable />
    </div>
  );
}
