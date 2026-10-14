/** Shared formatting so every page reads the same: $1,240.50 · 1.2M tokens · "3 days ago". */
export const NOW = "2026-09-26T15:43:00Z";
export const usd = (v: number, digits = 2) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
export const tokens = (v: number) =>
  v >= 1e9
    ? `${(v / 1e9).toFixed(1)}B`
    : v >= 1e6
      ? `${(v / 1e6).toFixed(1)}M`
      : v >= 1e3
        ? `${(v / 1e3).toFixed(1)}K`
        : `${Math.round(v)}`;
export const int = (v: number) => Math.round(v).toLocaleString("en-US");
export function relative(when: string) {
  if (!when) return "Never";
  const t = new Date(when.length === 10 ? `${when}T12:00:00Z` : when).getTime(),
    diff = (new Date(NOW).getTime() - t) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  const d = Math.floor(diff / 86400);
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
