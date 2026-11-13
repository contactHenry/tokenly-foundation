import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const money = z.number().finite();
const nonNegative = z.number().finite().nonnegative();

export const assistantSnapshotSchema = z.object({
  source: z.literal("sample-preview"),
  dataThrough: date,
  range: z.object({ label: z.string().max(30), from: date, to: date }),
  workspace: z.object({
    name: z.string().max(120),
    plan: z.string().max(80),
    timezone: z.string().max(80),
    currency: z.string().max(8),
  }),
  credits: z.object({
    balance: nonNegative,
    usdPerCredit: z.number().finite().positive(),
    usdValue: money,
    burnPerDay: nonNegative,
    runwayDays: nonNegative.nullable(),
  }),
  usage: z.object({
    totalCost: money,
    inputTokens: nonNegative,
    outputTokens: nonNegative,
    requestCount: z.number().int().nonnegative(),
    topModels: z
      .array(z.object({ name: z.string().max(100), cost: money, percent: nonNegative }))
      .max(10),
    topProjects: z
      .array(z.object({ name: z.string().max(100), cost: money, percent: nonNegative }))
      .max(20),
  }),
  projects: z
    .array(
      z.object({
        name: z.string().max(120),
        status: z.enum(["active", "paused"]),
        budget: money,
        monthToDateSpend: money,
        activeKeys: z.number().int().nonnegative(),
      }),
    )
    .max(50),
  budgets: z
    .array(
      z.object({
        scope: z.enum(["org", "project", "key"]),
        target: z.string().max(140),
        amount: money,
        period: z.enum(["daily", "weekly", "monthly"]),
        spent: money,
        percent: nonNegative,
        action: z.enum(["notify", "throttle", "stop"]),
      }),
    )
    .max(60),
  billing: z.object({
    planName: z.string().max(80),
    planPrice: money,
    includedCredits: nonNegative,
    autoRecharge: z.object({
      enabled: z.boolean(),
      threshold: nonNegative,
      amount: nonNegative,
      monthlyCap: money,
    }),
    invoices: z
      .array(
        z.object({
          number: z.string().max(60),
          date,
          amount: money,
          status: z.enum(["paid", "due", "failed"]),
        }),
      )
      .max(12),
    recentTransactions: z
      .array(
        z.object({
          date,
          type: z.enum(["top-up", "usage", "refund", "bonus"]),
          description: z.string().max(160),
          amount: money,
          balance: money,
        }),
      )
      .max(15),
  }),
  alerts: z.object({
    open: z.number().int().nonnegative(),
    acknowledged: z.number().int().nonnegative(),
    resolved: z.number().int().nonnegative(),
    rules: z
      .array(
        z.object({
          type: z.string().max(50),
          enabled: z.boolean(),
          value: nonNegative,
          channels: z.array(z.string().max(30)).max(8),
        }),
      )
      .max(12),
  }),
});

export type AssistantSnapshot = z.infer<typeof assistantSnapshotSchema>;

const uiMessageSchema = z
  .object({
    id: z.string().min(1).max(140),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.object({ type: z.string().min(1).max(80) }).passthrough()).max(50),
  })
  .passthrough();

export const assistantRequestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(40),
  snapshot: assistantSnapshotSchema,
});
