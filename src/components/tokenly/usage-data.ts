import { apiKeys, models, projects, teamMembers, usageEvents, type UsageEvent } from "@/lib/mock";

export const dimensions = { model: models, project: projects, key: apiKeys, user: teamMembers };
export type Dimension = keyof typeof dimensions;
// Shared per-model series colours so the Usage chart and every model breakdown
// (Overview top consumers, etc.) show the same colour for the same model.
// Sharp, high-contrast hues that stay distinguishable in light and dark mode.
export const MODEL_COLORS: Record<string, string> = {
  "gpt-4o": "#2563eb",
  "gpt-4o-mini": "#06b6d4",
  "claude-sonnet": "#ea580c",
  "llama-3": "#16a34a",
  "gemini-flash": "#9333ea",
  "text-embedding-3": "#e11d48",
};
export type UsageFilters = {
  model?: string | undefined;
  project?: string | undefined;
  key?: string | undefined;
  user?: string | undefined;
  token?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
};
export type GroupRow = {
  id: string;
  name: string;
  requests: number;
  input: number;
  output: number;
  cost: number;
  percent: number;
  spark: number[];
  trend: number;
};
export const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });
export const compact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
export const shiftDate = (date: string, days: number) =>
  new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const labelFor = (kind: Dimension, id: string) =>
  dimensions[kind].find((item) => item.id === id)?.name ?? id;
export function filteredEvents(filters: UsageFilters, defaultFrom: string, defaultTo: string) {
  const from = filters.from ?? defaultFrom,
    to = filters.to ?? defaultTo;
  return usageEvents.filter(
    (event) =>
      event.date >= from &&
      event.date <= to &&
      (!filters.model || event.modelId === filters.model) &&
      (!filters.project || event.projectId === filters.project) &&
      (!filters.key || event.keyId === filters.key) &&
      (!filters.user || event.userId === filters.user),
  );
}
export function measure(event: UsageEvent, token?: string | undefined) {
  if (token === "input")
    return {
      input: event.inputTokens,
      output: 0,
      cost:
        (event.inputTokens * (models.find((m) => m.id === event.modelId)?.inputPerMillion ?? 0)) /
        1e6,
    };
  if (token === "output")
    return {
      input: 0,
      output: event.outputTokens,
      cost:
        (event.outputTokens * (models.find((m) => m.id === event.modelId)?.outputPerMillion ?? 0)) /
        1e6,
    };
  return { input: event.inputTokens, output: event.outputTokens, cost: event.cost };
}
export function groupEvents(
  events: UsageEvent[],
  dimension: Dimension,
  token?: string | undefined,
  endDate?: string,
): GroupRow[] {
  const field =
    dimension === "model"
      ? "modelId"
      : dimension === "project"
        ? "projectId"
        : dimension === "key"
          ? "keyId"
          : "userId";
  const allCost = sum(events.map((e) => measure(e, token).cost));
  return dimensions[dimension]
    .map((item) => {
      const subset = events.filter((e) => e[field] === item.id);
      const values = subset.map((e) => measure(e, token));
      const cost = sum(values.map((v) => v.cost));
      const current = endDate
        ? sum(
            subset
              .filter((e) => e.date >= shiftDate(endDate, -6))
              .map((e) => measure(e, token).cost),
          )
        : 0;
      const prior = endDate
        ? sum(
            subset
              .filter((e) => e.date >= shiftDate(endDate, -13) && e.date < shiftDate(endDate, -6))
              .map((e) => measure(e, token).cost),
          )
        : 0;
      const spark = Array.from({ length: 7 }, (_, i) =>
        sum(
          subset
            .filter((e) => e.date === shiftDate(endDate ?? "2026-09-26", i - 6))
            .map((e) => measure(e, token).cost),
        ),
      );
      return {
        id: item.id,
        name: item.name,
        requests: subset.length,
        input: sum(values.map((v) => v.input)),
        output: sum(values.map((v) => v.output)),
        cost,
        percent: allCost ? (cost / allCost) * 100 : 0,
        spark,
        trend: prior ? ((current - prior) / prior) * 100 : 0,
      };
    })
    .filter((row) => row.requests > 0)
    .sort((a, b) => b.cost - a.cost);
}
