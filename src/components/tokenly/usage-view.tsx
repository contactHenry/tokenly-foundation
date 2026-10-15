import { IconTile } from "@/components/tokenly/primitives";
import { pages as pageMeta } from "@/components/tokenly/nav";
import { PageHeader } from "@/components/tokenly/primitives";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  ArrowUpDown,
  Download,
  Save,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailDrawer, EmptyState, Sparkline } from "@/components/tokenly/primitives";
import { useDateRange } from "@/components/tokenly/app-shell";
import { models, teamMembers } from "@/lib/mock";
import {
  compact,
  dimensions,
  filteredEvents,
  groupEvents,
  labelFor,
  measure,
  MODEL_COLORS,
  money,
  shiftDate,
  type Dimension,
  type GroupRow,
  type UsageFilters,
} from "@/components/tokenly/usage-data";

type Search = UsageFilters & { action?: string | undefined };
type SavedView = { name: string; filters: UsageFilters };
const FILTERS = ["model", "project", "key", "user", "token"] as const;
const names = {
  model: "Model",
  project: "Project",
  key: "API key",
  user: "User",
  token: "Token type",
};
const seriesColor = (group: Dimension, id: string, index: number) =>
  group === "model" ? (MODEL_COLORS[id] ?? `var(--chart-${(index % 5) + 1})`) : `var(--chart-${(index % 5) + 1})`;
const metrics = ["Cost", "Tokens", "Requests"] as const;
// The "Last 7d" column holds a sparkline array; sort it by its total.
const sortNumber = (value: unknown) =>
  Array.isArray(value) ? value.reduce((a: number, b: number) => a + b, 0) : Number(value);
const getStored = (): SavedView[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("tokenly-saved-usage-views") ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v?.name === "string" && typeof v?.filters === "object")
      : [];
  } catch {
    return [];
  }
};
function downloadCsv(rows: GroupRow[], dimension: Dimension) {
  const content = [
    "name,requests,input_tokens,output_tokens,cost,percent,trend_percent",
    ...rows.map((r) =>
      [
        r.name,
        r.requests,
        r.input,
        r.output,
        r.cost.toFixed(4),
        r.percent.toFixed(2),
        r.trend.toFixed(2),
      ]
        // Prefix values a spreadsheet would run as a formula (=, +, -, @) so they stay plain text.
        .map((v) => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : String(v)))
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokenly-usage-by-${dimension}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function UsageView() {
  const search = useSearch({ from: "/usage" });
  const navigate = useNavigate({ from: "/usage" });
  const range = useDateRange();
  const from = search.from ?? range.from,
    to = search.to ?? range.to;
  const filters: Search = search;
  const update = (patch: Partial<Search>) =>
    navigate({ to: "/usage", search: (prev) => ({ ...prev, ...patch }), replace: true });
  const events = useMemo(
    () => filteredEvents(filters, range.from, range.to),
    [search, range.from, range.to],
  );
  const [group, setGroup] = useState<Dimension>("model");
  const [metric, setMetric] = useState<(typeof metrics)[number]>("Cost");
  const [hidden, setHidden] = useState<string[]>([]);
  const [sort, setSort] = useState<keyof GroupRow>("cost");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GroupRow | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<{
    model?: string | undefined;
    project?: string | undefined;
    key?: string | undefined;
    user?: string | undefined;
    token?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
  }>({});
  const activeCount =
    FILTERS.filter((k) => search[k]).length + (search.from || search.to ? 1 : 0);
  const [saved, setSaved] = useState<SavedView[]>([]);
  useEffect(() => {
    setSaved(getStored());
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, group]);
  const rows = useMemo(
    () => groupEvents(events, group, search.token, to),
    [events, group, search.token, to],
  );
  const sorted = [...rows].sort(
    (a, b) =>
      (typeof a[sort] === "string"
        ? String(a[sort]).localeCompare(String(b[sort]))
        : sortNumber(a[sort]) - sortNumber(b[sort])) * (descending ? -1 : 1),
  );
  const pageSize = 5,
    pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);
  const measured = events.map((e) => measure(e, search.token));
  const input = measured.reduce((s, e) => s + e.input, 0),
    output = measured.reduce((s, e) => s + e.output, 0),
    cost = measured.reduce((s, e) => s + e.cost, 0);
  const days = Array.from(
    {
      length: Math.min(
        90,
        Math.max(
          0,
          Math.round(
            (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
              86400000,
          ) + 1,
        ),
      ),
    },
    (_, i) => shiftDate(from, i),
  );
  const series = rows.slice(0, 5);
  const chartData = days.map((date) => {
    const matching = events.filter((e) => e.date === date);
    return {
      date,
      ...Object.fromEntries(
        series.map((row) => {
          const subset = matching.filter(
            (e) =>
              e[group === "model" ? "modelId" : group === "project" ? "projectId" : "keyId"] ===
              row.id,
          );
          return [
            row.id,
            subset.reduce((s, e) => {
              const v = measure(e, search.token);
              return (
                s + (metric === "Cost" ? v.cost : metric === "Tokens" ? v.input + v.output : 1)
              );
            }, 0),
          ];
        }),
      ),
    };
  });
  const selectedEvents = selected
    ? events.filter(
        (e) =>
          e[group === "model" ? "modelId" : group === "project" ? "projectId" : "keyId"] ===
          selected.id,
      )
    : [];
  const selectedInputCost = selectedEvents.reduce((sum, e) => sum + measure(e, "input").cost, 0);
  const selectedOutputCost = selectedEvents.reduce((sum, e) => sum + measure(e, "output").cost, 0);
  const endpoints = ["/v1/chat/completions", "/v1/responses", "/v1/embeddings"]
    .map((name) => ({ name, count: selectedEvents.filter((e) => e.endpoint === name).length }))
    .filter((item) => item.count)
    .sort((a, b) => b.count - a.count);
  const save = () => {
    const name = viewName.trim();
    if (!name) return;
    const next = [
      ...saved.filter((v) => v.name !== name),
      {
        name,
        filters: {
          model: search.model,
          project: search.project,
          key: search.key,
          user: search.user,
          token: search.token,
          from,
          to,
        },
      },
    ];
    try {
      localStorage.setItem("tokenly-saved-usage-views", JSON.stringify(next));
    } catch {
      toast.error("Couldn't save this view on this device (storage is full or blocked).");
      return;
    }
    const replaced = saved.some((v) => v.name === name);
    setSaved(next);
    setSaveOpen(false);
    setViewName("");
    toast.success(replaced ? `View "${name}" updated` : `View "${name}" saved`);
  };
  const clear = () =>
    update({
      model: undefined,
      project: undefined,
      key: undefined,
      user: undefined,
      token: undefined,
      from: undefined,
      to: undefined,
      action: undefined,
    });
  return (
    <div className="space-y-6">
      <PageHeader
        title={pageMeta.usage.label}
        description={pageMeta.usage.description}
        actions={
          <>
            {saved.length > 0 && (
              <Select
                onValueChange={(name) => {
                  const view = saved.find((v) => v.name === name);
                  if (view)
                    update({
                      model: undefined,
                      project: undefined,
                      key: undefined,
                      user: undefined,
                      token: undefined,
                      ...view.filters,
                    });
                }}
              >
                <SelectTrigger
                  className="h-9 w-auto gap-2 border-none bg-transparent text-xs shadow-none"
                  aria-label="Saved views"
                >
                  <SelectValue placeholder="Saved views" />
                </SelectTrigger>
                <SelectContent>
                  {saved.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft({
                  model: search.model,
                  project: search.project,
                  key: search.key,
                  user: search.user,
                  token: search.token,
                  from,
                  to,
                });
                setFilterOpen(true);
              }}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 rounded-full bg-foreground px-1.5 text-[10px] font-semibold text-background">
                  {activeCount}
                </span>
              )}
            </Button>
          </>
        }
      />
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.filter((kind) => search[kind]).map((kind) => (
            <button
              key={kind}
              type="button"
              className="inline-flex h-7 items-center gap-1.5 bg-muted px-2.5 text-xs hover:bg-accent"
              onClick={() => update({ [kind]: undefined })}
            >
              <span className="text-muted-foreground">{names[kind]}</span>
              {kind === "token" ? search.token : labelFor(kind, search[kind] ?? "")}
              <X className="size-3" />
            </button>
          ))}
          {(search.from || search.to) && (
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 bg-muted px-2.5 text-xs hover:bg-accent"
              onClick={() => update({ from: undefined, to: undefined })}
            >
              <span className="text-muted-foreground">Date</span>
              {from} – {to}
              <X className="size-3" />
            </button>
          )}
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={clear}
          >
            Clear all
          </button>
        </div>
      )}

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription>Narrow down usage, then apply or save as a view.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Token type</label>
              <div className="flex gap-1 rounded-md bg-muted p-1">
                {([["all", "All"], ["input", "Input"], ["output", "Output"]] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={(draft.token ?? "all") === value}
                    onClick={() =>
                      setDraft((d) => ({ ...d, token: value === "all" ? undefined : value }))
                    }
                    className={`h-7 flex-1 rounded-sm text-xs font-medium transition-colors ${
                      (draft.token ?? "all") === value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="All models"
                  active={!draft.model}
                  onClick={() => setDraft((d) => ({ ...d, model: undefined }))}
                />
                {dimensions.model.map((entity) => (
                  <FilterChip
                    key={entity.id}
                    label={entity.name}
                    active={draft.model === entity.id}
                    dot={MODEL_COLORS[entity.id]}
                    onClick={() =>
                      setDraft((d) => ({ ...d, model: d.model === entity.id ? undefined : entity.id }))
                    }
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Project</label>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="All projects"
                  active={!draft.project}
                  onClick={() => setDraft((d) => ({ ...d, project: undefined }))}
                />
                {dimensions.project.map((entity) => (
                  <FilterChip
                    key={entity.id}
                    label={entity.name}
                    active={draft.project === entity.id}
                    onClick={() =>
                      setDraft((d) => ({ ...d, project: d.project === entity.id ? undefined : entity.id }))
                    }
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["key", "user"] as const).map((kind) => (
                <div key={kind} className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">{names[kind]}</label>
                  <Select
                    value={draft[kind] ?? "all"}
                    onValueChange={(value) =>
                      setDraft((d) => ({ ...d, [kind]: value === "all" ? undefined : value }))
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-sm" aria-label={`Filter by ${names[kind]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {names[kind].toLowerCase()}s</SelectItem>
                      {dimensions[kind].map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Date range</label>
              <div className="flex flex-wrap gap-1.5">
                {([7, 30, 90] as const).map((days) => {
                  const from = shiftDate("2026-09-26", -(days - 1));
                  const active = draft.from === from && draft.to === "2026-09-26";
                  return (
                    <FilterChip
                      key={days}
                      label={`Last ${days} days`}
                      active={active}
                      onClick={() =>
                        setDraft((d) => ({ ...d, from, to: "2026-09-26" }))
                      }
                    />
                  );
                })}
                <FilterChip
                  label="Custom"
                  active={
                    !!draft.from &&
                    ![7, 30, 90].some(
                      (days) => draft.from === shiftDate("2026-09-26", -(days - 1)) && draft.to === "2026-09-26",
                    )
                  }
                  onClick={() =>
                    setDraft((d) => ({ ...d, from: d.from ?? "2026-09-01", to: d.to ?? "2026-09-26" }))
                  }
                />
              </div>
              {draft.from && (
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="From date"
                    type="date"
                    value={draft.from}
                    max={draft.to}
                    onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                    className="h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">–</span>
                  <Input
                    aria-label="To date"
                    type="date"
                    value={draft.to ?? ""}
                    min={draft.from}
                    max="2026-09-26"
                    onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setDraft({ model: undefined, project: undefined, key: undefined, user: undefined, token: undefined, from: undefined, to: undefined })
              }
            >
              Reset
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  update({ ...draft });
                  setFilterOpen(false);
                  setSaveOpen(true);
                }}
              >
                <Save className="size-4" />
                Save as view
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  update({ ...draft });
                  setFilterOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ["Total cost", money(cost)],
          ["Total tokens", compact(input + output)],
          ["Input : output", output ? `${(input / output).toFixed(1)} : 1` : "—"],
          [
            "Avg cost / 1K",
            input + output
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                }).format((cost * 1000) / (input + output))
              : "—",
          ],
          ["Requests", events.length.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="surface p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {events.length === 0 ? (
        <EmptyState
          icon={Search}
          tone="sky"
          title="No usage matches these filters"
          description="Try another range or remove a filter."
          action={
            <Button variant="outline" onClick={clear}>
              <X />
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <section className="surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2.5 font-semibold">
                  <IconTile icon={TrendingUp} tone="sky" size="sm" />
                  Usage over time
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Grouped by {group === "key" ? "API key" : group}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex rounded-lg bg-muted p-1">
                  {metrics.map((option) => (
                    <Button
                      key={option}
                      variant={metric === option ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setMetric(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Select
                  value={group}
                  onValueChange={(value) => {
                    setGroup(value as Dimension);
                    setHidden([]);
                  }}
                >
                  <SelectTrigger className="w-36" aria-label="Group by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model">By model</SelectItem>
                    <SelectItem value="project">By project</SelectItem>
                    <SelectItem value="key">By API key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {series.map((row, i) => (
                <Button
                  key={row.id}
                  variant="ghost"
                  size="sm"
                  className={
                    hidden.includes(row.id) ? "text-muted-foreground opacity-40" : "text-foreground"
                  }
                  onClick={() =>
                    setHidden((current) =>
                      current.includes(row.id)
                        ? current.filter((v) => v !== row.id)
                        : [...current, row.id],
                    )
                  }
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: seriesColor(group, row.id, i) }}
                  />
                  {row.name}
                </Button>
              ))}
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.slice(5)}
                    minTickGap={24}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(value) => (metric === "Cost" ? `$${value}` : compact(value))}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value, name) => [
                      metric === "Cost" ? money(Number(value)) : Number(value).toLocaleString(),
                      labelFor(group, String(name)),
                    ]}
                  />
                  {series
                    .filter((row) => !hidden.includes(row.id))
                    .map((row) => (
                      <Bar
                        key={row.id}
                        dataKey={row.id}
                        stackId="a"
                        fill={seriesColor(group, row.id, series.indexOf(row))}
                        isAnimationActive={false}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <h3 className="flex items-center gap-2.5 font-semibold">
                  <IconTile icon={Activity} tone="brand" size="sm" />
                  Usage by {group === "key" ? "API key" : group}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rows.length} groups · click a row for details
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadCsv(sorted, group)}>
                <Download className="size-4" />
                CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 bg-muted/70 text-xs text-muted-foreground">
                  <tr>
                    {(
                      [
                        ["name", "Name"],
                        ["requests", "Requests"],
                        ["input", "Input tokens"],
                        ["output", "Output tokens"],
                        ["cost", "Cost"],
                        ["percent", "% of total"],
                        ["spark", "Last 7d"],
                        ["trend", "Trend"],
                      ] as const
                    ).map(([key, title]) => (
                      <th key={key} scope="col" className="px-4 py-3 font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-7 px-2 text-xs"
                          onClick={() => {
                            setDescending(sort === key ? !descending : true);
                            setSort(key);
                          }}
                        >
                          {title}
                          <ArrowUpDown className="size-3" />
                        </Button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Details for ${row.name}`}
                      className="cursor-pointer border-t hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
                      onClick={() => setSelected(row)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(row);
                        }
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.requests.toLocaleString()}</td>
                      <td className="px-4 py-3">{compact(row.input)}</td>
                      <td className="px-4 py-3">{compact(row.output)}</td>
                      <td className="px-4 py-3 font-medium">{money(row.cost)}</td>
                      <td className="px-4 py-3">{row.percent.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <Sparkline data={row.spark} />
                      </td>
                      <td className="px-4 py-3">
                        {row.trend > 0 ? (
                          <span className="inline-flex items-center text-success">
                            ↑ {row.trend.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-critical">
                            ↓ {Math.abs(row.trend).toFixed(0)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
              <span>
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
      <DetailDrawer
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name ?? "Usage details"}
        description={`${group === "key" ? "API key" : group} · ${from} – ${to}`}
      >
        <div className="space-y-6">
          {selected && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Cost", money(selected.cost)],
                  ["Requests", selected.requests.toLocaleString()],
                  ["Input tokens", compact(selected.input)],
                  ["Output tokens", compact(selected.output)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold">Last 7 days</h4>
                <div className="mt-3 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selected.spark.map((value, index) => ({
                        day: shiftDate(to, index - 6),
                        value,
                      }))}
                    >
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--chart-1)"
                        fill="var(--chart-fill)"
                        isAnimationActive={false}
                      />
                      <Tooltip formatter={(value) => money(Number(value))} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Cost breakdown</h4>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Input tokens</span>
                  <span>{money(selectedInputCost)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Output tokens</span>
                  <span>{money(selectedOutputCost)}</span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Top users</h4>
                <div className="mt-2 space-y-2">
                  {teamMembers
                    .map((user) => ({
                      user,
                      count: events.filter(
                        (e) =>
                          e.userId === user.id &&
                          e[
                            group === "model"
                              ? "modelId"
                              : group === "project"
                                ? "projectId"
                                : "keyId"
                          ] === selected.id,
                      ).length,
                    }))
                    .filter((v) => v.count)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3)
                    .map((v) => (
                      <p key={v.user.id} className="flex justify-between text-sm">
                        <span>{v.user.name}</span>
                        <span className="text-muted-foreground">{v.count} requests</span>
                      </p>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Top endpoints</h4>
                <div className="mt-2 space-y-2">
                  {endpoints.map((item) => (
                    <p key={item.name} className="flex justify-between gap-4 text-sm">
                      <span className="truncate">{item.name}</span>
                      <span className="shrink-0 text-muted-foreground">{item.count} requests</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    to="/limits"
                    search={{
                      project: group === "project" ? selected.id : undefined,
                      action: "adjust-limit",
                    }}
                  >
                    Set limit <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/projects">
                    View key <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </DetailDrawer>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
            <DialogDescription>Keep this filter set on this device.</DialogDescription>
          </DialogHeader>
          <Input
            aria-label="View name"
            placeholder="e.g. Production spend"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
          />
          <Button disabled={!viewName.trim()} onClick={save}>
            <Save />
            Save view
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
