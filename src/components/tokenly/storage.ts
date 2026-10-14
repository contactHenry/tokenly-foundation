/**
 * Merges data read from localStorage onto the seed state, keeping only fields whose
 * shape matches the seed. Corrupt, outdated or hand-edited storage then falls back to
 * defaults field by field instead of crashing every page that reads the store.
 */
export function restoreState<T extends object>(raw: string | null, seed: T): T {
  if (!raw) return seed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return seed;
  }
  if (!isRecord(parsed)) return seed;
  const next = { ...seed } as Record<string, unknown>;
  for (const [key, fallback] of Object.entries(seed)) {
    const value = parsed[key];
    if (sameShape(value, fallback)) next[key] = value;
  }
  return next as T;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function sameShape(value: unknown, fallback: unknown) {
  if (value === undefined) return false;
  // Nullable fields (e.g. `viewAs`, `onboarding`) are seeded as null; accept null or an object/string.
  if (fallback === null)
    return value === null || typeof value === "object" || typeof value === "string";
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (isRecord(fallback)) return isRecord(value);
  return typeof value === typeof fallback;
}
