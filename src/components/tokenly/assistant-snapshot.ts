import type { DateSelection } from "@/components/tokenly/app-shell";
import {
  buildLedger,
  burnPerDay as currentBurnPerDay,
  PLAN,
  runwayDays,
  USD_PER_CREDIT,
  type InvoiceStatus,
  type LedgerEntry,
} from "@/components/tokenly/billing-store";
import {
  budgetSpend,
  scopeName,
  type AlertRule,
  type AlertStatus,
  type BudgetRule,
} from "@/components/tokenly/limits-store";
import {
  projectMtd,
  type ManagedKey,
  type ManagedProject,
} from "@/components/tokenly/projects-store";
import { filteredEvents, groupEvents } from "@/components/tokenly/usage-data";
import type { AssistantSnapshot } from "@/lib/assistant-contract";
import { invoices, organization } from "@/lib/mock";

type SnapshotInput = {
  range: DateSelection;
  billing: {
    balance: number;
    autoRecharge: { enabled: boolean; threshold: number; amount: number; monthlyCap: number };
    invoiceStatus: Record<string, InvoiceStatus>;
    extraLedger: LedgerEntry[];
  };
  projectsState: { projects: ManagedProject[]; keys: ManagedKey[] };
  limitsState: {
    budgets: BudgetRule[];
    rules: AlertRule[];
    statuses: Record<string, AlertStatus>;
  };
  workspace: { general: { name: string; timezone: string; currency: string } };
};

/** Compact, read-only context: no API secrets, card details, email addresses or webhook config. */
export function buildAssistantSnapshot({
  range,
  billing,
  projectsState,
  limitsState,
  workspace,
}: SnapshotInput): AssistantSnapshot {
  const events = filteredEvents({}, range.from, range.to);
  const topModels = groupEvents(events, "model", undefined, range.to).slice(0, 6);
  const topProjects = groupEvents(events, "project", undefined, range.to).slice(0, 6);
  const burn = currentBurnPerDay();
  const runway = runwayDays(billing.balance);
  const statuses = Object.values(limitsState.statuses);

  return {
    source: "sample-preview",
    dataThrough: "2026-09-26",
    range: { label: range.label, from: range.from, to: range.to },
    workspace: {
      name: workspace.general.name,
      plan: organization.plan,
      timezone: workspace.general.timezone,
      currency: workspace.general.currency,
    },
    credits: {
      balance: billing.balance,
      usdPerCredit: USD_PER_CREDIT,
      usdValue: Number((billing.balance * USD_PER_CREDIT).toFixed(2)),
      burnPerDay: Number(burn.toFixed(2)),
      runwayDays: Number.isFinite(runway) ? runway : null,
    },
    usage: {
      totalCost: Number(events.reduce((sum, event) => sum + event.cost, 0).toFixed(2)),
      inputTokens: events.reduce((sum, event) => sum + event.inputTokens, 0),
      outputTokens: events.reduce((sum, event) => sum + event.outputTokens, 0),
      requestCount: events.length,
      topModels: topModels.map((row) => ({
        name: row.name,
        cost: Number(row.cost.toFixed(2)),
        percent: Number(row.percent.toFixed(1)),
      })),
      topProjects: topProjects.map((row) => ({
        name: row.name,
        cost: Number(row.cost.toFixed(2)),
        percent: Number(row.percent.toFixed(1)),
      })),
    },
    projects: projectsState.projects.map((project) => ({
      name: project.name,
      status: project.status,
      budget: project.budget,
      monthToDateSpend: Number(projectMtd(project.id).toFixed(2)),
      activeKeys: projectsState.keys.filter(
        (key) => key.projectId === project.id && key.status === "active",
      ).length,
    })),
    budgets: limitsState.budgets.map((budget) => {
      const spent = budgetSpend(budget);
      return {
        scope: budget.scope,
        target: scopeName(budget.scope, budget.targetId, projectsState.projects),
        amount: budget.amount,
        period: budget.period,
        spent: Number(spent.toFixed(2)),
        percent: Number(((spent / budget.amount) * 100).toFixed(1)),
        action: budget.action,
      };
    }),
    billing: {
      planName: PLAN.name,
      planPrice: PLAN.price,
      includedCredits: PLAN.includedCredits,
      autoRecharge: billing.autoRecharge,
      invoices: invoices.map((invoice) => ({
        number: invoice.number,
        date: invoice.date,
        amount: invoice.amount,
        status: billing.invoiceStatus[invoice.id] ?? "due",
      })),
      recentTransactions: buildLedger(billing.extraLedger, billing.balance)
        .slice(0, 12)
        .map((entry) => ({
          date: entry.date,
          type: entry.type,
          description: entry.description,
          amount: entry.amount,
          balance: entry.balance,
        })),
    },
    alerts: {
      open: statuses.filter((status) => status === "open").length,
      acknowledged: statuses.filter((status) => status === "acknowledged").length,
      resolved: statuses.filter((status) => status === "resolved").length,
      rules: limitsState.rules.map((rule) => ({
        type: rule.type,
        enabled: rule.enabled,
        value: rule.value,
        channels: rule.channels,
      })),
    },
  };
}
