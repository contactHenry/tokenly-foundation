import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  KeyRound,
  SlidersHorizontal,
  TriangleAlert,
  UserPlus,
  Wallet,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailDrawer, EmptyState } from "@/components/tokenly/primitives";
import { activityEvents, projects, teamMembers } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { relative } from "./format";

type AuditType = "top-up" | "limit" | "key" | "alert" | "member" | "settings";
type Audit = {
  id: string;
  at: string;
  type: AuditType;
  actorId: string | null;
  action: string;
  target: string;
  detail: string;
  projectId?: string | undefined;
  ip?: string;
};
const actorFor: Record<string, string | null> = {
  act_01: null,
  act_02: "usr_02",
  act_03: null,
  act_04: "usr_04",
  act_05: "usr_01",
  act_06: "usr_01",
  act_07: null,
  act_08: "usr_01",
  act_09: "usr_02",
};
const hours = ["14:32", "10:05", "16:48", "09:21", "11:37", "08:02", "19:15", "08:10", "09:44"];
const actionFor: Record<ActivityType, string> = {
  "top-up": "added credits",
  limit: "updated a budget",
  key: "created an API key",
  alert: "fired an alert",
};
type ActivityType = (typeof activityEvents)[number]["type"];
export const auditLog: Audit[] = (
  [
    ...activityEvents.map((e, i) => ({
      id: e.id,
      at: `${e.date}T${hours[i] ?? "12:00"}:00Z`,
      type: e.type,
      actorId: actorFor[e.id] ?? null,
      action: actionFor[e.type],
      target: e.title.replace(/ (created|updated|warning|detected|added|resolved)$/i, ""),
      detail: e.detail,
      projectId: e.projectId,
      ip: actorFor[e.id] ? "102.89.34.12" : "",
    })),
    {
      id: "aud_10",
      at: "2026-09-24T13:12:00Z",
      type: "key",
      actorId: "usr_03",
      action: "rotated an API key",
      target: "Production server key",
      detail: "Previous secret stopped working immediately",
      projectId: "prj_01",
      ip: "41.58.12.201",
    },
    {
      id: "aud_11",
      at: "2026-09-20T10:30:00Z",
      type: "member",
      actorId: "usr_01",
      action: "invited a member",
      target: "noah@acmestudio.example",
      detail: "Role: Finance viewer",
      ip: "102.89.34.12",
    },
    {
      id: "aud_12",
      at: "2026-09-15T17:02:00Z",
      type: "settings",
      actorId: "usr_02",
      action: "changed workspace settings",
      target: "Timezone",
      detail: "UTC → Africa/Lagos",
      ip: "197.210.64.3",
    },
    {
      id: "aud_13",
      at: "2026-09-08T12:45:00Z",
      type: "key",
      actorId: "usr_03",
      action: "revoked an API key",
      target: "Old staging key",
      detail: "Key made 0 requests in the prior 7 days",
      projectId: "prj_04",
      ip: "41.58.12.201",
    },
  ] as Audit[]
).sort((a, b) => b.at.localeCompare(a.at));

const typeMeta: Record<AuditType, { label: string; icon: typeof KeyRound }> = {
  "top-up": { label: "Credits", icon: Wallet },
  limit: { label: "Budgets", icon: SlidersHorizontal },
  key: { label: "API keys", icon: KeyRound },
  alert: { label: "Alerts", icon: TriangleAlert },
  member: { label: "Team", icon: UserPlus },
  settings: { label: "Settings", icon: Settings2 },
};
const member = (id: string | null) => teamMembers.find((m) => m.id === id);
const dayLabel = (d: string) =>
  d === "2026-09-26"
    ? "Today"
    : d === "2026-09-25"
      ? "Yesterday"
      : new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
const time = (at: string) =>
  new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

function Avatar({ id }: { id: string | null }) {
  const m = member(id);
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
        m ? "bg-accent text-primary" : "bg-muted text-muted-foreground",
      )}
      aria-hidden
    >
      {m ? m.initials : "TK"}
    </span>
  );
}

export function ActivityView({ from, to }: { from: string; to: string }) {
  const [actor, setActor] = useState("all"),
    [type, setType] = useState("all"),
    [project, setProject] = useState("all"),
    [open, setOpen] = useState<Audit | null>(null);
  const rows = useMemo(
    () =>
      auditLog.filter((a) => {
        const d = a.at.slice(0, 10);
        return (
          d >= from &&
          d <= to &&
          (actor === "all" || (actor === "system" ? a.actorId === null : a.actorId === actor)) &&
          (type === "all" || a.type === type) &&
          (project === "all" || a.projectId === project)
        );
      }),
    [from, to, actor, type, project],
  );
  const groups = useMemo(() => {
    const m = new Map<string, Audit[]>();
    rows.forEach((r) => {
      const d = r.at.slice(0, 10);
      m.set(d, [...(m.get(d) ?? []), r]);
    });
    return [...m.entries()];
  }, [rows]);
  const filtered = actor !== "all" || type !== "all" || project !== "all";
  const clear = () => {
    setActor("all");
    setType("all");
    setProject("all");
  };
  const sel = (
    label: string,
    value: string,
    set: (v: string) => void,
    opts: [string, string][],
  ) => (
    <Select value={value} onValueChange={set}>
      <SelectTrigger className="h-9 w-full sm:w-44" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {opts.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {sel("Actors", actor, setActor, [
          ...teamMembers.map((m) => [m.id, m.name] as [string, string]),
          ["system", "Tokenly (system)"],
        ])}
        {sel(
          "Event types",
          type,
          setType,
          Object.entries(typeMeta).map(([k, v]) => [k, v.label] as [string, string]),
        )}
        {sel(
          "Projects",
          project,
          setProject,
          projects.map((p) => [p.id, p.name] as [string, string]),
        )}
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {rows.length} event{rows.length === 1 ? "" : "s"}
        </span>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
      {groups.length ? (
        <div className="space-y-8">
          {groups.map(([day, items]) => (
            <section
              key={day}
              aria-labelledby={`d-${day}`}
              className="border-b border-border pb-8 last:border-b-0 last:pb-0"
            >
              <h3
                id={`d-${day}`}
                className="mb-4 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {dayLabel(day)}
              </h3>
              <ol className="space-y-1">
                {items.map((a) => {
                  const m = member(a.actorId),
                    I = typeMeta[a.type].icon;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(a)}
                        className="flex w-full items-start justify-between gap-4 px-1 py-3 text-left transition-colors duration-150 hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <span className="flex min-w-0 items-start gap-4">
                          <Avatar id={a.actorId} />
                          <span className="min-w-0">
                            <span className="block text-sm">
                              <span className="font-medium">{m?.name ?? "Tokenly"}</span>{" "}
                              <span className="text-muted-foreground">{a.action}</span>{" "}
                              <span className="font-medium">{a.target}</span>
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                              <span className="flex items-center gap-1 font-medium text-primary">
                                <I className="size-3" aria-hidden />
                                {typeMeta[a.type].label}
                              </span>
                              <span className="text-muted-foreground">· {a.detail}</span>
                            </span>
                          </span>
                        </span>
                        <time
                          dateTime={a.at}
                          className="shrink-0 text-xs tabular-nums text-muted-foreground"
                        >
                          {time(a.at)}
                        </time>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filtered ? "No events match these filters" : "No activity in this range"}
          description={
            filtered
              ? "Try removing a filter."
              : "Choose a wider date range to see earlier activity."
          }
          {...(filtered
            ? {
                action: (
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                ),
              }
            : {})}
        />
      )}
      <DetailDrawer
        open={!!open}
        onOpenChange={(v) => !v && setOpen(null)}
        title={open ? `${member(open.actorId)?.name ?? "Tokenly"} ${open.action}` : ""}
        description={
          open
            ? `${dayLabel(open.at.slice(0, 10))} at ${time(open.at)} UTC · ${relative(open.at)}`
            : ""
        }
      >
        {open && (
          <div className="space-y-5 text-sm">
            <dl className="divide-y rounded-xl border">
              {[
                [
                  "Actor",
                  member(open.actorId)
                    ? `${member(open.actorId)!.name} · ${member(open.actorId)!.email}`
                    : "Tokenly (automated)",
                ],
                ["Action", open.action],
                ["Target", open.target],
                ["Details", open.detail],
                ["Event type", typeMeta[open.type].label],
                ["Project", projects.find((p) => p.id === open.projectId)?.name ?? "Workspace"],
                ["IP address", open.ip || "—"],
                ["Event ID", open.id],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="col-span-2 break-words">{v}</dd>
                </div>
              ))}
            </dl>
            {open.projectId && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/projects" search={{ project: open.projectId }}>
                  Open project
                </Link>
              </Button>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
