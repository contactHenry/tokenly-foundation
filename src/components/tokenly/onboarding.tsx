import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjectsStore } from "./projects-store";
import { useLimitsStore } from "./limits-store";
import { useWorkspace, workspaceActions } from "./workspace-store";

/** Shown on Overview while previewing a brand-new account. Steps complete when the real action happens. */
export function OnboardingChecklist() {
  const { onboarding } = useWorkspace();
  const p = useProjectsStore();
  const l = useLimitsStore();
  if (!onboarding) return null;
  const steps = [
    {
      title: "Create a project",
      body: "Group keys and spending by product or team.",
      done: p.projects.length > onboarding.projects,
      to: "/projects" as const,
      cta: "Create project",
    },
    {
      title: "Generate an API key",
      body: "Use it to send your first request.",
      done: p.keys.length > onboarding.keys,
      to: "/projects" as const,
      cta: "Create key",
    },
    {
      title: "Set a budget",
      body: "Get warned before you overspend.",
      done: l.budgets.length > onboarding.budgets,
      to: "/limits" as const,
      cta: "Set budget",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length,
    next = steps.findIndex((s) => !s.done);
  return (
    <section aria-labelledby="onb" className="surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h3 id="onb" className="font-semibold">
            Welcome to Tokenly — let's get you set up
          </h3>
          <p className="text-sm text-muted-foreground">
            {doneCount === 3 ? "All done. You're ready to go." : `${doneCount} of 3 done`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 w-32 rounded-md bg-muted"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={3}
            aria-label="Setup progress"
          >
            <div
              className="h-full rounded-md bg-primary transition-[width] duration-200"
              style={{ width: `${(doneCount / 3) * 100}%` }}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => workspaceActions.startOnboarding(null)}>
            {doneCount === 3 ? "Close" : "Skip"}
          </Button>
        </div>
      </div>
      <ol className="divide-y">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-4 p-5">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md border text-sm font-semibold",
                s.done
                  ? "border-success bg-success-muted text-success"
                  : i === next
                    ? "border-primary text-primary"
                    : "text-muted-foreground",
              )}
            >
              {s.done ? <Check className="size-4" aria-label="Done" /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-sm font-medium",
                  s.done && "text-muted-foreground line-through",
                )}
              >
                {s.title}
              </span>
              <span className="block text-sm text-muted-foreground">{s.body}</span>
            </span>
            {!s.done && (
              <Button asChild size="sm" variant={i === next ? "default" : "outline"}>
                <Link to={s.to}>
                  {s.cta}
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
