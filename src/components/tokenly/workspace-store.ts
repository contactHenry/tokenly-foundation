import { useSyncExternalStore } from "react";
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
          if (r) state = { ...seed(), ...(JSON.parse(r) as State) };
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
export function useRole() {
  const s = useWorkspace();
  const me = s.members.find((m) => m.id === s.currentUserId);
  const role: Role = s.viewAs ?? me?.role ?? "Owner";
  return { role, can: (p: Permission) => ROLE_PERMS[role].includes(p) };
}
export const workspaceActions = {
  setViewAs(viewAs: Role | null) {
    set({ ...state, viewAs });
  },
  setGeneral(general: State["general"]) {
    set({ ...state, general });
  },
  invite(email: string, role: Role) {
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
  },
  setRole(id: string, role: Role) {
    set({ ...state, members: state.members.map((m) => (m.id === id ? { ...m, role } : m)) });
  },
  remove(id: string) {
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
};
