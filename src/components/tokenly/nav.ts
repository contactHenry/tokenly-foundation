import {
  Activity,
  CreditCard,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  type IconComponent,
} from "@/components/icons";
import type { Tone } from "@/components/tokenly/primitives";

export type Page = {
  label: string;
  to: "/" | "/usage" | "/projects" | "/limits" | "/billing" | "/activity" | "/settings";
  icon: IconComponent;
  tone: Tone;
  description: string;
};

/** Every top-level page, with the icon and colour it uses in the sidebar, header and search. */
export const pages = {
  overview: {
    label: "Overview",
    to: "/",
    icon: LayoutDashboard,
    tone: "brand",
    description: "Your balance, runway, and what's driving spend.",
  },
  usage: {
    label: "Usage",
    to: "/usage",
    icon: Activity,
    tone: "sky",
    description: "Tokens, cost and requests by model, project, key and user.",
  },
  activity: {
    label: "Activity",
    to: "/activity",
    icon: Gauge,
    tone: "rose",
    description: "Who did what, and when. Follows the date range at the top.",
  },
  projects: {
    label: "Projects & Keys",
    to: "/projects",
    icon: KeyRound,
    tone: "violet",
    description: "Group spend by project and manage the API keys behind it.",
  },
  limits: {
    label: "Limits & Alerts",
    to: "/limits",
    icon: ShieldAlert,
    tone: "amber",
    description: "Catch overspend before it happens.",
  },
  billing: {
    label: "Billing",
    to: "/billing",
    icon: CreditCard,
    tone: "teal",
    description: "Credits, auto-recharge, payment methods and invoices.",
  },
  settings: {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    tone: "slate",
    description: "Workspace details, team, notifications and integrations.",
  },
} satisfies Record<string, Page>;

export const navGroups: { label: string; items: Page[] }[] = [
  { label: "Monitor", items: [pages.overview, pages.usage, pages.activity] },
  { label: "Manage", items: [pages.projects, pages.limits, pages.billing] },
  { label: "Workspace", items: [pages.settings] },
];
