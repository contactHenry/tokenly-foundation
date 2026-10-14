import { useSyncExternalStore } from "react";
import { restoreState } from "@/components/tokenly/storage";
import { guarded } from "@/components/tokenly/workspace-store";
import {
  apiKeys,
  budgets,
  projects,
  teamMembers,
  usageEvents,
  type ApiKey,
  type Project,
} from "@/lib/mock";

export type ManagedProject = Project & { ownerId: string; memberIds: string[] };
export type ManagedKey = ApiKey & {
  createdBy: string;
  last4: string;
  spendCap?: number;
  allowedModels: string[];
};
type State = { projects: ManagedProject[]; keys: ManagedKey[] };

const STORAGE = "tokenly-projects-v1";
const seed = (): State => ({
  projects: projects.map((p, i) => ({
    ...p,
    ownerId: teamMembers[i % 4]?.id ?? "usr_01",
    memberIds: teamMembers.filter((_, m) => (m + i) % 3 !== 2).map((m) => m.id),
  })),
  keys: apiKeys.map((k, i) => ({
    ...k,
    createdBy: teamMembers[i % teamMembers.length]?.id ?? "usr_01",
    last4: ["a9F2", "Qm7x", "3kLp", "Zt81", "w4Rb", "H6nc", "p0Ve", "Xy5d"][i] ?? "0000",
    allowedModels: [],
  })),
});

let state: State = seed();
let loaded = false;
const listeners = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE);
    state = restoreState(raw, seed());
  } catch {
    /* keep seed */
  }
}
function set(next: State) {
  state = next;
  try {
    localStorage.setItem(STORAGE, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
const serverState = seed();

export function useProjectsStore() {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      cb();
      return () => listeners.delete(cb);
    },
    () => state,
    () => serverState,
  );
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
function randomSecret(length = 40) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const actions = guarded(
  {
    createProject(input: { name: string; description: string; budget: number; ownerId: string }) {
      const id = `prj_${Date.now().toString(36)}`;
      set({
        ...state,
        projects: [
          ...state.projects,
          {
            id,
            name: input.name,
            description: input.description,
            budget: input.budget,
            status: "active",
            ownerId: input.ownerId,
            memberIds: [input.ownerId],
          },
        ],
      });
      return id;
    },
    createKey(input: {
      name: string;
      projectId: string;
      spendCap?: number;
      allowedModels: string[];
    }) {
      const secret = `sk-${randomSecret()}`;
      const key: ManagedKey = {
        id: `key_${Date.now().toString(36)}`,
        name: input.name,
        prefix: "sk-",
        projectId: input.projectId,
        createdAt: "2026-09-26",
        lastUsedAt: "",
        status: "active",
        createdBy: "usr_01",
        last4: secret.slice(-4),
        allowedModels: input.allowedModels,
        ...(input.spendCap ? { spendCap: input.spendCap } : {}),
      };
      set({ ...state, keys: [key, ...state.keys] });
      return secret;
    },
    revokeKey(id: string) {
      set({
        ...state,
        keys: state.keys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)),
      });
    },
    rotateKey(id: string) {
      const secret = `sk-${randomSecret()}`;
      set({
        ...state,
        keys: state.keys.map((k) =>
          k.id === id ? { ...k, last4: secret.slice(-4), createdAt: "2026-09-26" } : k,
        ),
      });
      return secret;
    },
    updateProject(
      id: string,
      patch: Partial<Pick<ManagedProject, "name" | "description" | "budget" | "status">>,
    ) {
      set({
        ...state,
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      });
    },
  },
  {
    createProject: "manageProjects",
    updateProject: "manageProjects",
    createKey: "manageKeys",
    revokeKey: "manageKeys",
    rotateKey: "manageKeys",
  },
);

export const LAST_DAY = "2026-09-26";
export const shift = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const requestsFor = (tokens: number) => Math.round(tokens / 420);
export function keyStats(keyId: string) {
  const from30 = shift(LAST_DAY, -29),
    from7 = shift(LAST_DAY, -6);
  let spend30 = 0,
    tokens7 = 0;
  for (const e of usageEvents) {
    if (e.keyId !== keyId) continue;
    if (e.date >= from30) spend30 += e.cost;
    if (e.date >= from7) tokens7 += e.inputTokens + e.outputTokens;
  }
  return { spend30, requests7: requestsFor(tokens7) };
}
export function projectMtd(projectId: string) {
  const b = budgets.find((x) => x.projectId === projectId);
  if (b) return b.spent;
  return usageEvents
    .filter((e) => e.projectId === projectId && e.date >= "2026-09-01")
    .reduce((s, e) => s + e.cost, 0);
}
export function relativeTime(date: string) {
  if (!date) return "Never";
  const days = Math.round(
    (Date.parse(`${LAST_DAY}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000,
  );
  return days <= 0
    ? "Today"
    : days === 1
      ? "Yesterday"
      : days < 30
        ? `${days} days ago`
        : `${Math.round(days / 30)} mo ago`;
}
export const maskKey = (k: ManagedKey) => `sk-...${k.last4}`;
