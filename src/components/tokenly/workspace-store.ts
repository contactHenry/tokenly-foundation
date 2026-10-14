import { useSyncExternalStore } from "react";
import { restoreState } from "@/components/tokenly/storage";
import { toast } from "sonner";
import { teamMembers } from "@/lib/mock";

export const ROLES = ["Owner", "Admin", "Developer", "Finance viewer"] as const;
export type Role = (typeof ROLES)[number];
export const PERMISSIONS = [
  { id: "viewUsage", label: "View usage & overview" },
  { id: "manageKeys", label: "Create, rotate & revoke API keys" },
  { id: "manageProjects", label: "Create & edit projects" },
  { id: "manageLimits", label: "Edit budgets & alert rules" },
  { id: "viewBilling", label: "View billing & invoices" },
  { id: "manageBilling", label: "Top up & manage payment methods" },
  { id: "manageTeam", label: "Invite members & change roles" },
  { id: "manageWorkspace", label: "Edit workspace settings" },
] as const;
export type Permission = (typeof PERMISSIONS)[number]["id"];
export const ROLE_PERMS: Record<Role, Permission[]> = {
  Owner: PERMISSIONS.map((p) => p.id),
  Admin: [
    "viewUsage",
    "manageKeys",
    "manageProjects",
    "manageLimits",
    "viewBilling",
    "manageBilling",
    "manageTeam",
  ],
  Developer: ["viewUsage", "manageKeys", "manageProjects"],
  "Finance viewer": ["viewUsage", "viewBilling"],
};
export const deniedReason = (role: Role) =>
  `Your role (${role}) can't do this. Ask an Owner or Admin.`;

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  lastActive: string;
  pending?: boolean;
};
export type Channel = "inApp" | "email" | "slack";
type State = {
  currentUserId: string;
  viewAs: Role | null;
  members: Member[];
  general: { name: string; timezone: string; currency: string };
  prefs: Record<string, Record<Channel, boolean>>;
  slack: { connected: boolean; channel: string };
  webhook: { url: string; enabled: boolean; secret: string };
  readNotifications: string[];
  onboarding: { projects: number; keys: number; budgets: number } | null;
};
export const NOTIFICATION_TYPES = [
  { id: "budget", label: "Budget thresholds" },
  { id: "spike", label: "Usage spikes" },
  { id: "balance", label: "Low balance" },
  { id: "keys", label: "New API keys" },
  { id: "billing", label: "Invoices & payments" },
] as const;

const lastActive = [
  "2026-09-26T15:20:00Z",
  "2026-09-26T09:05:00Z",
  "2026-09-25T18:40:00Z",
  "2026-09-22T11:00:00Z",
  "2026-09-14T08:30:00Z",
];
const seed = (): State => ({
  currentUserId: "usr_01",
  viewAs: null,
  members: teamMembers.map((m, i) => ({
    ...m,
    role: (m.role === "Viewer" ? "Finance viewer" : m.role) as Role,
    lastActive: lastActive[i] ?? lastActive[0]!,
  })),
  general: { name: "Acme Studio", timezone: "Africa/Lagos", currency: "USD" },
  prefs: Object.fromEntries(
    NOTIFICATION_TYPES.map((t) => [t.id, { inApp: true, email: t.id !== "keys", slack: false }]),
  ),
  slack: { connected: false, channel: "#ai-spend" },
  webhook: { url: "", enabled: false, secret: "whsec_demo_7f3a" },
  readNotifications: [],
  onboarding: null,
});
const KEY = "tokenly-workspace-v1";
let state = seed();
let loaded = false;
const server = seed();
const listeners = new Set<() => void>();
function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
export function useWorkspace() {
  return useSyncExternalStore(
    (cb) => {
      if (!loaded) {
        loaded = true;
        try {
          const r = localStorage.getItem(KEY);
          state = restoreState(r, seed());
          if (state.viewAs && !ROLES.includes(state.viewAs)) state = { ...state, viewAs: null };
        } catch {
          /* seed */
        }
      }
      listeners.add(cb);
      cb();
      return () => listeners.delete(cb);
    },
    () => state,
    () => server,
  );
}
function roleOf(s: State): Role {
  const me = s.members.find((m) => m.id === s.currentUserId);
  const real: Role = me && ROLES.includes(me.role) ? me.role : "Owner";
  // Previewing can only narrow permissions, never grant more than your real role has.
  const preview =
    s.viewAs && ROLE_PERMS[s.viewAs]?.every((p) => ROLE_PERMS[real].includes(p)) ? s.viewAs : null;
  return preview ?? real;
}
export function useRole() {
  const role = roleOf(useWorkspace());
  return { role, can: (p: Permission) => ROLE_PERMS[role].includes(p) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionMap = Record<string, (...args: any[]) => any>;
type Guarded<T extends ActionMap> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<T[K]> | undefined;
};
/**
 * Wraps store actions so each one re-checks the active role before it runs. <Gate> only
 * disables buttons; this stops any code path (a missed button, a console call) from
 * mutating data the role isn't allowed to touch. Denied calls toast and return undefined.
 */
export function guarded<T extends ActionMap>(
  actions: T,
  perms: Partial<Record<keyof T, Permission>>,
): Guarded<T> {
  return Object.fromEntries(
    Object.entries(actions).map(([name, fn]) => [
      name,
      (...args: unknown[]) => {
        const perm = perms[name as keyof T];
        const role = roleOf(state);
        if (perm && !ROLE_PERMS[role].includes(perm)) {
          toast.error(deniedReason(role));
          return undefined;
        }
        return fn(...args);
      },
    ]),
  ) as unknown as Guarded<T>;
}
export const workspaceActions = guarded(
  {
    setViewAs(viewAs: Role | null) {
      set({ ...state, viewAs });
    },
    setGeneral(general: State["general"]) {
      set({ ...state, general });
    },
    invite(email: string, role: Role) {
      email = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
      if (state.members.some((m) => m.email.toLowerCase() === email)) return false;
      // Only an Owner can hand out the Owner role.
      if (role === "Owner" && roleOf(state) !== "Owner") return false;
      const name = email.split("@")[0] ?? email;
      set({
        ...state,
        members: [
          ...state.members,
          {
            id: `inv_${Date.now().toString(36)}`,
            name,
            email,
            role,
            initials: name.slice(0, 2).toUpperCase(),
            lastActive: "",
            pending: true,
          },
        ],
      });
      return true;
    },
    setRole(id: string, role: Role) {
      const target = state.members.find((m) => m.id === id);
      // Nobody changes their own role, and only an Owner can grant or take away Owner.
      if (!target || id === state.currentUserId) return;
      if ((role === "Owner" || target.role === "Owner") && roleOf(state) !== "Owner") return;
      set({ ...state, members: state.members.map((m) => (m.id === id ? { ...m, role } : m)) });
    },
    remove(id: string) {
      const target = state.members.find((m) => m.id === id);
      // The current user and Owners can't be removed from here (avoids an ownerless workspace).
      if (!target || id === state.currentUserId || target.role === "Owner") return;
      set({ ...state, members: state.members.filter((m) => m.id !== id) });
    },
    setPref(type: string, channel: Channel, on: boolean) {
      set({
        ...state,
        prefs: {
          ...state.prefs,
          [type]: {
            ...(state.prefs[type] ?? { inApp: true, email: true, slack: false }),
            [channel]: on,
          },
        },
      });
    },
    setSlack(slack: State["slack"]) {
      set({ ...state, slack });
    },
    setWebhook(webhook: State["webhook"]) {
      set({ ...state, webhook });
    },
    startOnboarding(base: { projects: number; keys: number; budgets: number } | null) {
      set({ ...state, onboarding: base });
    },
    markRead(ids: string[]) {
      set({ ...state, readNotifications: [...new Set([...state.readNotifications, ...ids])] });
    },
  },
  {
    setGeneral: "manageWorkspace",
    setSlack: "manageWorkspace",
    setWebhook: "manageWorkspace",
    invite: "manageTeam",
    setRole: "manageTeam",
    remove: "manageTeam",
  },
);
