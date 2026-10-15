import { useEffect, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  RotateCcw,
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpDown,
  BellOff,
  ChevronDown,
  MoreHorizontal,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/components/icons";
import type { Severity } from "@/lib/mock";

export type Tone = "brand" | "sky" | "violet" | "amber" | "teal" | "rose" | "slate";
/**
 * Icon slot for headers, rows and empty states. The monochrome system keeps icons to navigation
 * and metric cards, so by default this renders nothing; pass `plain` (metric cards, command menu)
 * to show a bare line icon in the muted ink. `tone` is accepted for compatibility and ignored.
 */
export function IconTile({
  icon: Icon,
  plain = false,
  size = "md",
  className,
}: {
  icon: IconComponent;
  tone?: Tone | undefined;
  plain?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!plain) return null;
  return (
    <Icon
      aria-hidden
      className={cn(
        "shrink-0 text-muted-foreground",
        size === "sm" && "size-4",
        size === "md" && "size-5",
        size === "lg" && "size-6",
        className,
      )}
    />
  );
}
/** Page title row: title, one-line description, and optional actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
/** Heading for a section inside a page. */
export function SectionHeader({
  icon,
  tone = "slate",
  title,
  description,
  actions,
}: {
  icon?: IconComponent;
  tone?: Tone | undefined;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <IconTile icon={icon} tone={tone} size="sm" />}
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
/**
 * Status without hue: healthy is a quiet grey chip, warning a darker grey chip, critical solid
 * ink. Neutral is an outlined chip.
 */
export function StatusBadge({
  status,
  children,
}: {
  status: Severity | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        status === "healthy" && "bg-muted text-foreground",
        status === "warning" && "bg-foreground/12 text-foreground",
        status === "critical" && "bg-foreground text-background",
        status === "neutral" && "text-muted-foreground ring-1 ring-inset ring-border",
      )}
    >
      {children}
    </span>
  );
}
/** Animates the numeric part of a formatted string (e.g. "$1,240.50", "42,000") from 0 on mount / change. */
export function CountUp({ value, duration = 600 }: { value: string; duration?: number }) {
  const match = value.match(/-?[\d,]*\.?\d+/);
  const target = match ? Number(match[0].replace(/,/g, "")) : NaN;
  const decimals = match?.[0].split(".")[1]?.length ?? 0;
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (
      !match ||
      !Number.isFinite(target) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration),
        eased = 1 - Math.pow(1 - t, 3);
      const n = (target * eased).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      setShown(value.replace(match[0], n));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span aria-label={value}>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
export function ErrorState({
  title = "Couldn't load this data",
  description = "Something went wrong. Your data is safe — try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-52 flex-col items-center justify-center rounded-xl border bg-card px-6 py-8 text-center"
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
export function Sparkline({ data }: { data: number[] }) {
  return (
    <div className="h-11 w-24 shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((value, index) => ({ index, value }))}>
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1)"
            fill="var(--chart-fill)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function StatCard({
  label,
  value,
  delta,
  sparkline,
  status,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  delta?: number;
  sparkline?: number[];
  status?: Severity;
  detail?: string;
  icon?: IconComponent;
  tone?: Tone | undefined;
}) {
  return (
    <div className="surface flex min-h-40 flex-col justify-between gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          {icon && <IconTile icon={icon} plain size="sm" />}
          {label}
        </span>
        {status && (
          <StatusBadge status={status}>
            {status === "healthy" ? "Healthy" : status === "warning" ? "Attention" : "Critical"}
          </StatusBadge>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-semibold leading-tight tracking-tight">
            <CountUp value={value} />
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center font-medium",
                  delta >= 0 ? "text-success" : "text-critical",
                )}
              >
                {delta >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(delta)}%
              </span>
            )}
            {detail && <span>{detail}</span>}
          </div>
        </div>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
    </div>
  );
}
export function ThresholdProgress({
  value,
  warning = 75,
  critical = 90,
  label,
}: {
  value: number;
  warning?: number;
  critical?: number;
  label?: string;
}) {
  const state: Severity = value >= critical ? "critical" : value >= warning ? "warning" : "healthy";
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs">
        {label && <span className="text-muted-foreground">{label}</span>}
        <span className="ml-auto font-medium">{Math.round(value)}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            state === "healthy" ? "bg-success" : state === "warning" ? "bg-warning" : "bg-critical",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
        <span
          className="absolute top-[-3px] h-3.5 w-px bg-foreground/30"
          style={{ left: `${warning}%` }}
        />
        <span
          className="absolute top-[-3px] h-3.5 w-px bg-foreground/30"
          style={{ left: `${critical}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-end gap-3 text-[10px] text-muted-foreground">
        <span>{warning}% warning</span>
        <span>{critical}% limit</span>
      </div>
    </div>
  );
}
export type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
};
export function DataTable<T>({
  rows,
  columns,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; direction: 1 | -1 } | null>(null);
  const sorted = [...rows].sort((a, b) => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!column?.sortValue || !sort) return 0;
    const first = column.sortValue(a),
      second = column.sortValue(b);
    return (
      (typeof first === "number" && typeof second === "number"
        ? first - second
        : String(first).localeCompare(String(second))) * sort.direction
    );
  });
  const activate = (row: T) => (event: React.KeyboardEvent) => {
    if (onRowClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onRowClick(row);
    }
  };
  const rowCls = cn(
    "transition-colors duration-150 hover:bg-muted/50",
    onRowClick &&
      "cursor-pointer focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
  );
  return (
    <>
      <div className="hidden overflow-x-auto surface md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-muted/70 text-xs text-muted-foreground backdrop-blur-sm">
            <tr>
              {columns.map((column) => (
                <th
                  scope="col"
                  key={column.key}
                  aria-sort={
                    sort?.key === column.key
                      ? sort.direction === 1
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn("px-5 py-3 font-medium", column.className)}
                >
                  {column.sortValue ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-7 px-2 text-xs text-muted-foreground"
                      onClick={() =>
                        setSort((current) => ({
                          key: column.key,
                          direction:
                            current?.key === column.key && current.direction === 1 ? -1 : 1,
                        }))
                      }
                    >
                      {column.label}
                      <ArrowUpDown className="size-3" aria-hidden />
                    </Button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr
                key={index}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={activate(row)}
                onClick={() => onRowClick?.(row)}
                className={cn("border-t", rowCls)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-3.5", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden">
        {sorted.map((row, index) => {
          const [first, ...rest] = columns;
          return (
            <li
              key={index}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={activate(row)}
              onClick={() => onRowClick?.(row)}
              className={cn("surface p-4 text-sm", rowCls)}
            >
              {first && <div className="mb-2 font-medium">{first.render(row)}</div>}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {rest.map((column) => (
                  <div
                    key={column.key}
                    className={cn("min-w-0", !column.label && "col-span-2 flex justify-end")}
                  >
                    {column.label && (
                      <dt className="text-xs text-muted-foreground">{column.label}</dt>
                    )}
                    <dd className="min-w-0 truncate">{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
export function FilterBar({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filters">
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "rounded-md shadow-none",
            selected === option && "border border-primary/20 text-primary-ink",
          )}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon = BellOff,
  tone = "slate",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconComponent;
  tone?: Tone | undefined;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      <IconTile icon={icon} tone={tone} size="lg" className="mb-4" />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function LoadingSkeleton() {
  return (
    <div className="surface p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
export function AlertBanner({
  tone,
  title,
  description,
  onDismiss,
  action,
}: {
  tone: "info" | "warning" | "critical";
  title: string;
  description: string;
  onDismiss?: () => void;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        tone === "info" && "bg-muted/60",
        tone === "warning" && "border-foreground/25 bg-muted",
        tone === "critical" && "border-foreground bg-card",
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-3 sm:hidden">{action}</div>}
      </div>
      {action && <div className="hidden shrink-0 self-center sm:block">{action}</div>}
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={`Dismiss ${title}`}
          onClick={onDismiss}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
export function ChartCard({
  title,
  subtitle,
  data,
  timeframe,
  legend = ["Input tokens", "Output tokens"],
}: {
  title: string;
  subtitle?: string;
  data: { date: string; inputTokens: number; outputTokens: number }[];
  timeframe?: string;
  legend?: string[];
}) {
  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {timeframe && (
            <span className="rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground">
              {timeframe}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chart actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  const csv = [
                    "date,inputTokens,outputTokens",
                    ...data.map((d) => `${d.date},${d.inputTokens},${d.outputTokens}`),
                  ].join("\n");
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                  link.download = "tokenly-usage.csv";
                  link.click();
                  URL.revokeObjectURL(link.href);
                }}
              >
                Download CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground">
        {legend.map((item, index) => (
          <span key={item} className="flex items-center gap-2">
            <span
              className={cn("size-2 rounded-full", index === 0 ? "bg-chart-1" : "bg-chart-3")}
            />
            {item}
          </span>
        ))}
      </div>
      <div className="mt-5 h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="tokenlyArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(value) =>
                new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              minTickGap={26}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <ChartTooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--popover-foreground)",
              }}
              formatter={(value) => Number(value).toLocaleString()}
              labelFormatter={(label) => String(label)}
            />
            <Area
              type="monotone"
              dataKey="inputTokens"
              name="Input tokens"
              stroke="var(--chart-1)"
              fill="url(#tokenlyArea)"
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="outputTokens"
              name="Output tokens"
              stroke="var(--chart-3)"
              fill="transparent"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export function DetailDrawer({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}) {
  return (
    <Sheet {...(open !== undefined ? { open } : {})} {...(onOpenChange ? { onOpenChange } : {})}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description || "Details"}</SheetDescription>
        </SheetHeader>
        <div className="mt-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
