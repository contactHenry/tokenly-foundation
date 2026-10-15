import { budgetSpend, useLimitsStore } from "@/components/tokenly/limits-store";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CreditCard,
  Gauge,
  Wallet,
  CircleCheck,
  TrendingUp,
  Users,
  Zap,
  type IconComponent,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconTile, StatusBadge, type Tone } from "@/components/tokenly/primitives";
import { cn } from "@/lib/utils";
import {
  activityEvents,
  apiKeys,
  budgets,
  creditAccount,
  dailyUsage,
  models,
  projects,
  usageEvents,
  type Severity,
  type UsageEvent,
} from "@/lib/mock";
import type { DateSelection } from "@/components/tokenly/app-shell";

/** Figures can arrive missing (empty range, half-loaded data); render a dash, never crash. */
const money = (amount?: number | null) =>
  Number.isFinite(amount as number)
    ? (amount as number).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      })
    : "—";
const num = (value?: number | null) =>
  Number.isFinite(value as number) ? Math.round(value as number).toLocaleString("en-US") : "—";
const shortDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const DAY = 86400000;
const today = dailyUsage.at(-1)?.date ?? "2026-09-26";
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const utc = (date: string) => new Date(`${date}T00:00:00Z`).getTime();
const shift = (date: string, days: number) =>
  new Date(utc(date) + days * DAY).toISOString().slice(0, 10);

export function getOverviewData(range: DateSelection, balance = creditAccount.balance) {
  const days = dailyUsage.filter((day) => day.date >= range.from && day.date <= range.to);
  const events = usageEvents.filter((event) => event.date >= range.from && event.date <= range.to);
  const dayCount = Math.max(1, Math.round((utc(range.to) - utc(range.from)) / DAY) + 1);
  const spend = sum(days.map((day) => day.cost));
  const previousEnd = shift(range.from, -1);
  const previousStart = shift(range.from, -dayCount);
  const previousDays = dailyUsage.filter(
    (day) => day.date >= previousStart && day.date <= previousEnd,
  );
  const previousSpend = sum(previousDays.map((day) => day.cost));
  const lastSeven = dailyUsage.filter(
    (day) => day.date >= shift(range.to, -6) && day.date <= range.to,
  );
  const previousSeven = dailyUsage.filter(
    (day) => day.date >= shift(range.to, -13) && day.date < shift(range.to, -6),
  );
  const burn =
    sum(lastSeven.map((day) => day.cost)) /
    Math.max(1, lastSeven.length) /
    creditAccount.usdPerCredit;
  const priorBurn = previousSeven.length
    ? sum(previousSeven.map((day) => day.cost)) / previousSeven.length / creditAccount.usdPerCredit
    : 0;
  const runway = burn > 0 ? Math.ceil(balance / burn) : null;
  const depletion = runway !== null ? shift(range.to, runway) : null;
  const monthlyBudget = sum(budgets.map((b) => b.monthlyLimit));
  const budget = (monthlyBudget * dayCount) / 30;
  const budgetPercent = budget > 0 ? (spend / budget) * 100 : 0;
  const currentMonth = range.to.slice(0, 7) === today.slice(0, 7);
  const monthEnd = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0))
    .toISOString()
    .slice(0, 10);
  const forecastEnd = range.to === today && currentMonth ? monthEnd : range.to;
  const lastDaySpend = days.at(-1)?.cost ?? 0;
  const forecastDays = Math.max(0, Math.round((utc(forecastEnd) - utc(range.to)) / DAY));
  const trend = days.map((day) => {
    const dayEvents = events.filter((event) => event.date === day.date);
    const topModelId = [...models].sort(
      (a, b) =>
        sum(dayEvents.filter((e) => e.modelId === b.id).map((e) => e.cost)) -
        sum(dayEvents.filter((e) => e.modelId === a.id).map((e) => e.cost)),
    )[0]?.id;
    return {
      date: day.date,
      actual: day.cost,
      forecast: day.date === range.to && forecastDays > 0 ? day.cost : null,
      tokens: day.inputTokens + day.outputTokens,
      topModel: models.find((m) => m.id === topModelId)?.name ?? "—",
    };
  });
  for (let index = 1; index <= forecastDays; index++)
    trend.push({
      date: shift(range.to, index),
      actual: null as never,
      forecast: Number(
        (
          lastDaySpend +
          ((burn * creditAccount.usdPerCredit - lastDaySpend) * index) / Math.max(1, forecastDays)
        ).toFixed(2),
      ),
      tokens: 0,
      topModel: "Projected",
    });
  return {
    balance,
    days,
    events,
    spend,
    previousSpend,
    burn,
    priorBurn,
    runway,
    depletion,
    budget,
    budgetPercent,
    monthlyBudget,
    trend,
    forecastDays,
    dayCount,
  };
}

export type OverviewData = ReturnType<typeof getOverviewData>;

export function OverviewSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading overview" role="status">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Skeleton className="h-96 rounded-xl lg:col-span-8" />
        <Skeleton className="h-96 rounded-xl lg:col-span-4" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  status = "healthy",
  icon,
  tone,
  children,
}: {
  label: string;
  value: string;
  detail: string;
  status?: Severity;
  icon: IconComponent;
  tone: Tone;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-40 min-w-0 flex-col justify-between gap-4 surface p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <IconTile icon={icon} plain size="sm" />
          {label}
        </p>
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            status === "healthy"
              ? "bg-muted-foreground/40"
              : status === "warning"
                ? "bg-muted-foreground"
                : "bg-foreground",
          )}
          aria-label={status}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[28px] font-semibold leading-tight tracking-tight">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        {children}
      </div>
    </div>
  );
}
function Meter({
  value,
  marker,
  status,
  label,
}: {
  value: number;
  marker?: number;
  status: Severity;
  label: string;
}) {
  return (
    <div className="mt-4">
      <div
        className="relative h-2 rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            status === "healthy"
              ? "bg-muted-foreground/40"
              : status === "warning"
                ? "bg-muted-foreground"
                : "bg-foreground",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
        {marker !== undefined && (
          <span
            className="absolute -top-1 h-4 border-l border-dashed border-foreground/70"
            style={{ left: `${marker}%` }}
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{Math.round(value)}% used</span>
        {marker !== undefined && <span>{marker}% threshold</span>}
      </div>
    </div>
  );
}
export function StatusRow({ data }: { data: OverviewData }) {
  const topUp = creditAccount.topUps[0]?.amount ?? 0;
  const sinceTopUp = Math.max(0, topUp - data.balance);
  const used = topUp > 0 ? (sinceTopUp / topUp) * 100 : 0;
  const creditStatus: Severity =
    data.runway !== null && data.runway < 7
      ? "critical"
      : data.runway !== null && data.runway < 14
        ? "warning"
        : "healthy";
  const budgetStatus: Severity =
    data.budgetPercent >= 100 ? "critical" : data.budgetPercent >= 80 ? "warning" : "healthy";
  const delta = data.priorBurn > 0 ? ((data.burn - data.priorBurn) / data.priorBurn) * 100 : null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        icon={Wallet}
        tone="brand"
        label="Credits remaining"
        value={num(data.balance)}
        detail={`vs. ${num(topUp)} at last top-up`}
        status={creditStatus}
      >
        <Meter value={used} status={creditStatus} label="Credits spent since last top-up" />
      </Metric>
      <Metric
        icon={Zap}
        tone="amber"
        label="Burn rate"
        value={`${num(data.burn)}/day`}
        detail="7-day average · credits/day"
        status={creditStatus}
      >
        <p
          className={cn(
            "mt-4 inline-flex items-center gap-1 text-xs font-medium",
            delta === null ? "text-muted-foreground" : delta > 0 ? "text-critical" : "text-success",
          )}
        >
          {delta === null ? (
            "No previous week"
          ) : (
            <>
              {delta > 0 ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowDownRight className="size-4" />
              )}
              {Math.abs(delta).toFixed(1)}% vs. prior 7 days
            </>
          )}
        </p>
      </Metric>
      <Metric
        icon={CalendarClock}
        tone="sky"
        label="Runway"
        value={data.runway === null ? "—" : `${data.runway} days left`}
        detail={
          data.depletion
            ? `Projected depletion ${shortDate(data.depletion)}`
            : "No burn in this range"
        }
        status={creditStatus}
      >
        <div className="mt-4">
          <StatusBadge status={creditStatus}>
            {creditStatus === "healthy"
              ? "On track"
              : creditStatus === "warning"
                ? "Under 14 days"
                : "Under 7 days"}
          </StatusBadge>
        </div>
      </Metric>
      <Metric
        icon={CreditCard}
        tone="violet"
        label="Spend this period"
        value={money(data.spend)}
        detail={`of ${money(data.budget)} period budget`}
        status={budgetStatus}
      >
        <Meter
          value={data.budgetPercent}
          marker={80}
          status={budgetStatus}
          label="Period budget used"
        />
      </Metric>
    </div>
  );
}

export function NeedsAttention({ data }: { data: OverviewData }) {
  // Read budgets from the limits store so edits and deletions show up here immediately.
  const { budgets: rules } = useLimitsStore();
  const flagged = rules
    .filter((r) => r.scope === "project" && r.period === "monthly" && r.amount > 0)
    .map((r) => ({ projectId: r.targetId, spent: budgetSpend(r), monthlyLimit: r.amount }))
    .filter((b) => b.spent / b.monthlyLimit >= 0.8)
    .sort((a, b) => b.spent / b.monthlyLimit - a.spent / a.monthlyLimit);
  const spike = data.events.some((e) => e.date === "2026-09-18");
  const items = [
    ...flagged.map((b) => ({
      id: b.projectId,
      title: `${projects.find((p) => p.id === b.projectId)?.name ?? "Project"} at ${Math.round((b.spent / b.monthlyLimit) * 100)}% of monthly budget`,
      detail: "Monthly limit is close",
      action: "Adjust limit",
      to: "/limits" as const,
      search: { project: b.projectId, action: "adjust-limit" },
    })),
    ...(spike
      ? [
          {
            id: "spike",
            title: "Usage spike on Production API",
            detail: "Sep 18 · 180% above the usual daily level",
            action: "Inspect",
            to: "/usage" as const,
            search: {
              key: "key_1",
              user: undefined,
              token: undefined,
              from: undefined,
              to: undefined,
              action: "inspect-spike",
            },
          },
        ]
      : []),
  ].slice(0, 3);
  return (
    <section aria-labelledby="attention-title" className="surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <h3 id="attention-title" className="flex items-center gap-2.5 font-semibold">
          <IconTile icon={BellRing} tone="amber" size="sm" />
          Needs attention
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-6">
          <IconTile icon={CircleCheck} tone="teal" size="sm" />
          <p className="text-sm text-muted-foreground">All good. Nothing needs you right now.</p>
        </div>
      ) : (
        <div className="divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link
                  to={item.to}
                  search={
                    item.to === "/limits"
                      ? { project: item.search.project, action: item.search.action }
                      : {
                          model: undefined,
                          project: undefined,
                          key: "key_1",
                          user: undefined,
                          token: undefined,
                          from: undefined,
                          to: undefined,
                          action: "inspect-spike",
                        }
                  }
                >
                  {item.action}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type TrendPoint = OverviewData["trend"][number];
function SpendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-sm">
      <p className="font-medium">{shortDate(label ?? point.date)}</p>
      <p className="mt-2">
        {point.actual === null ? "Projected spend" : "Cost"}:{" "}
        <strong>{money(point.actual ?? point.forecast ?? 0)}</strong>
      </p>
      {point.actual !== null && (
        <>
          <p className="mt-1">
            Tokens: <strong>{num(point.tokens)}</strong>
          </p>
          <p className="mt-1">
            Top model: <strong>{point.topModel}</strong>
          </p>
        </>
      )}
    </div>
  );
}
export function SpendTrend({ data, range }: { data: OverviewData; range: DateSelection }) {
  const dailyBudget = data.monthlyBudget / 30;
  return (
    <section aria-labelledby="spend-title" className="min-w-0 surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="spend-title" className="flex items-center gap-2.5 font-semibold">
            <IconTile icon={TrendingUp} tone="brand" size="sm" />
            Spend trend
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily spend ·{" "}
            {range.label === "Custom"
              ? `${shortDate(range.from)}–${shortDate(range.to)}`
              : range.label === "Today"
                ? "Today"
                : `last ${range.label}`}
          </p>
        </div>
        <span className="text-sm font-semibold">
          {money(data.spend)} <span className="font-normal text-muted-foreground">total</span>
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-primary" />
          Actual
        </span>
        {data.forecastDays > 0 && (
          <span className="flex items-center gap-2">
            <span className="w-4 border-t-2 border-dashed border-chart-3" />
            Forecast to month end
          </span>
        )}
        <span className="flex items-center gap-2">
          <span className="w-4 border-t border-dashed border-muted-foreground" />
          Daily budget pace
        </span>
      </div>
      <div className="mt-5 h-64 w-full" aria-label="Daily spend chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="spend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              minTickGap={28}
              tickFormatter={shortDate}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Tooltip content={<SpendTooltip />} />
            <ReferenceLine y={dailyBudget} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="actual"
              connectNulls={false}
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#spend-fill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="var(--chart-3)"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Budget pace {money(dailyBudget)}/day
        {data.forecastDays > 0 ? " · Forecast uses the recent 7-day average." : ""}
      </p>
    </section>
  );
}

type ConsumerKind = "model" | "project" | "key";
function ranked(events: UsageEvent[], prior: UsageEvent[], kind: ConsumerKind) {
  const entities = kind === "model" ? models : kind === "project" ? projects : apiKeys;
  const field = kind === "model" ? "modelId" : kind === "project" ? "projectId" : "keyId";
  const total = sum(events.map((e) => e.cost));
  return entities
    .map((entity) => {
      const cost = sum(events.filter((e) => e[field] === entity.id).map((e) => e.cost));
      const previous = sum(prior.filter((e) => e[field] === entity.id).map((e) => e.cost));
      return {
        id: entity.id,
        name: entity.name,
        cost,
        percent: total > 0 ? (cost / total) * 100 : 0,
        change: previous > 0 ? ((cost - previous) / previous) * 100 : null,
      };
    })
    .filter((item) => item.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
}
export function TopConsumers({ data, range }: { data: OverviewData; range: DateSelection }) {
  const [kind, setKind] = useState<ConsumerKind>("model");
  const prior = useMemo(
    () =>
      usageEvents.filter(
        (event) => event.date >= shift(range.from, -data.dayCount) && event.date < range.from,
      ),
    [range.from, data.dayCount],
  );
  const rows = ranked(data.events, prior, kind);
  return (
    <section aria-labelledby="consumers-title" className="min-w-0 surface p-5 sm:p-6">
      <div>
        <h3 id="consumers-title" className="flex items-center gap-2.5 font-semibold">
          <IconTile icon={Users} tone="sky" size="sm" />
          Top consumers
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Where your spend goes</p>
      </div>
      <Tabs value={kind} onValueChange={(value) => setKind(value as ConsumerKind)} className="mt-5">
        <TabsList className="grid h-9 w-full grid-cols-3">
          <TabsTrigger className="px-1 text-xs" value="model">
            Model
          </TabsTrigger>
          <TabsTrigger className="px-1 text-xs" value="project">
            Project
          </TabsTrigger>
          <TabsTrigger className="px-1 text-xs" value="key">
            API key
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-5 space-y-1">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No spend in this range.</p>
        ) : (
          rows.map((row, index) => (
            <Button
              key={row.id}
              asChild
              variant="ghost"
              className="h-auto w-full justify-start gap-3 rounded-lg px-2 py-2.5 text-left font-normal hover:bg-muted/70"
            >
              <Link
                to="/usage"
                search={{
                  model: kind === "model" ? row.id : undefined,
                  project: kind === "project" ? row.id : undefined,
                  key: kind === "key" ? row.id : undefined,
                  user: undefined,
                  token: undefined,
                  from: undefined,
                  to: undefined,
                  action: undefined,
                }}
                aria-label={`View usage for ${row.name}`}
              >
                <span className="w-4 shrink-0 text-xs text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{row.name}</span>
                    <span className="shrink-0 font-semibold">{money(row.cost)}</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-chart-1"
                        style={{ width: `${row.percent}%` }}
                      />
                    </span>
                    <span className="w-9 text-right text-xs text-muted-foreground">
                      {row.percent.toFixed(0)}%
                    </span>
                    <span
                      className={cn(
                        "flex w-5 justify-end",
                        row.change !== null && row.change > 0 ? "text-critical" : "text-success",
                      )}
                      title={
                        row.change === null
                          ? "No previous data"
                          : `${Math.abs(row.change).toFixed(0)}% ${row.change >= 0 ? "increase" : "decrease"} vs. previous period`
                      }
                    >
                      {row.change === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : row.change > 0 ? (
                        "↑"
                      ) : (
                        "↓"
                      )}
                    </span>
                  </span>
                </span>
              </Link>
            </Button>
          ))
        )}
      </div>
    </section>
  );
}
export function RecentActivity({ range }: { range: DateSelection }) {
  const visible = activityEvents
    .filter((event) => event.date >= range.from && event.date <= range.to)
    .slice(0, 6);
  return (
    <section aria-labelledby="activity-title" className="surface">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 id="activity-title" className="flex items-center gap-2.5 font-semibold">
            <IconTile icon={Gauge} tone="rose" size="sm" />
            Recent activity
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Changes across your workspace</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary-ink">
          <Link to="/activity">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      {visible.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">No activity in this range.</p>
      ) : (
        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-y-0">
          {visible.map((event) => {
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 border-b px-5 py-4 last:border-b-0 md:odd:border-r"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
                </div>
                <time dateTime={event.date} className="shrink-0 text-xs text-muted-foreground">
                  {shortDate(event.date)}
                </time>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
