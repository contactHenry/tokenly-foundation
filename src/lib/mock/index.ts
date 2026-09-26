export type Severity = "healthy" | "warning" | "critical";
export type MemberRole = "Owner" | "Admin" | "Developer" | "Viewer";
export interface Organization { id: string; name: string; slug: string; plan: string; }
export interface Project { id: string; name: string; description: string; status: "active" | "paused"; budget: number; }
export interface ApiKey { id: string; name: string; prefix: string; projectId: string; createdAt: string; lastUsedAt: string; status: "active" | "revoked"; }
export interface Model { id: string; name: string; provider: string; inputPerMillion: number; outputPerMillion: number; }
export interface TeamMember { id: string; name: string; email: string; role: MemberRole; initials: string; }
export interface UsageEvent { id: string; date: string; inputTokens: number; outputTokens: number; cost: number; modelId: string; projectId: string; keyId: string; userId: string; endpoint: string; }
export interface CreditTransaction { id: string; date: string; amount: number; method: string; }
export interface CreditAccount { balance: number; usdPerCredit: number; topUps: CreditTransaction[]; }
export interface Budget { projectId: string; monthlyLimit: number; spent: number; warningThreshold: number; criticalThreshold: number; }
export interface UsageAlert { id: string; title: string; description: string; severity: Severity; date: string; read: boolean; }
export interface Invoice { id: string; number: string; date: string; amount: number; status: "paid" | "pending"; }

export const organization: Organization = { id: "org_01", name: "Acme Studio", slug: "acme-studio", plan: "Growth plan" };
export const projects: Project[] = [
  { id: "prj_01", name: "Production API", description: "Customer-facing AI workflows", status: "active", budget: 1200 },
  { id: "prj_02", name: "Support Copilot", description: "Internal support assistant", status: "active", budget: 650 },
  { id: "prj_03", name: "Research Lab", description: "Model evaluation and experiments", status: "active", budget: 400 },
  { id: "prj_04", name: "Mobile App", description: "In-app smart features", status: "active", budget: 300 },
];
export const teamMembers: TeamMember[] = [
  { id: "usr_01", name: "Henry Nwachukwu", email: "henry@acmestudio.example", role: "Owner", initials: "HN" },
  { id: "usr_02", name: "Sofia Chen", email: "sofia@acmestudio.example", role: "Admin", initials: "SC" },
  { id: "usr_03", name: "Marcus Lee", email: "marcus@acmestudio.example", role: "Developer", initials: "ML" },
  { id: "usr_04", name: "Amara Okafor", email: "amara@acmestudio.example", role: "Developer", initials: "AO" },
  { id: "usr_05", name: "Noah Williams", email: "noah@acmestudio.example", role: "Viewer", initials: "NW" },
];
export const models: Model[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", inputPerMillion: 2.5, outputPerMillion: 10 },
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic", inputPerMillion: 3, outputPerMillion: 15 },
  { id: "llama-3", name: "Llama 3", provider: "Meta", inputPerMillion: .6, outputPerMillion: .9 },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", inputPerMillion: .15, outputPerMillion: .6 },
  { id: "gemini-flash", name: "Gemini Flash", provider: "Google", inputPerMillion: .35, outputPerMillion: 1.05 },
  { id: "text-embedding-3", name: "Text Embedding 3", provider: "OpenAI", inputPerMillion: .13, outputPerMillion: 0 },
];
export const apiKeys: ApiKey[] = projects.flatMap((project, index) => [
  { id: `key_${index * 2 + 1}`, name: `${project.name} · Live`, prefix: `tk_live_••••${["8f2a", "4b91", "7c03", "2d66"][index]}`, projectId: project.id, createdAt: "2026-06-18", lastUsedAt: "2026-09-26", status: "active" as const },
  { id: `key_${index * 2 + 2}`, name: `${project.name} · Test`, prefix: `tk_test_••••${["1e47", "9a18", "3f72", "5c09"][index]}`, projectId: project.id, createdAt: "2026-07-04", lastUsedAt: "2026-09-24", status: "active" as const },
]);
export const creditAccount: CreditAccount = { balance: 42000, usdPerCredit: .016, topUps: [
  { id: "top_01", date: "2026-09-01", amount: 25000, method: "Visa •••• 4242" },
  { id: "top_02", date: "2026-08-01", amount: 20000, method: "Visa •••• 4242" },
  { id: "top_03", date: "2026-07-01", amount: 20000, method: "Visa •••• 4242" },
] };
export const budgets: Budget[] = [
  { projectId: "prj_01", monthlyLimit: 1200, spent: 864, warningThreshold: 75, criticalThreshold: 90 },
  { projectId: "prj_02", monthlyLimit: 650, spent: 312, warningThreshold: 75, criticalThreshold: 90 },
  { projectId: "prj_03", monthlyLimit: 400, spent: 348, warningThreshold: 75, criticalThreshold: 90 },
  { projectId: "prj_04", monthlyLimit: 300, spent: 92, warningThreshold: 75, criticalThreshold: 90 },
];
export const alerts: UsageAlert[] = [
  { id: "alt_01", title: "Research Lab nearing budget", description: "87% of monthly budget used", severity: "warning", date: "2026-09-25", read: false },
  { id: "alt_02", title: "Unusual usage spike", description: "Production API usage increased on Sep 18", severity: "warning", date: "2026-09-18", read: false },
  { id: "alt_03", title: "Credit balance healthy", description: "Your credits are above the minimum threshold", severity: "healthy", date: "2026-09-15", read: true },
  { id: "alt_04", title: "Monthly budget reset", description: "All project budgets renewed", severity: "healthy", date: "2026-09-01", read: true },
  { id: "alt_05", title: "Low balance resolved", description: "Credits were topped up successfully", severity: "critical", date: "2026-08-29", read: true },
];
export type ActivityEvent = { id: string; date: string; type: "top-up" | "limit" | "key" | "alert"; title: string; detail: string; projectId?: string; keyId?: string };
export const activityEvents: ActivityEvent[] = [
  { id: "act_01", date: "2026-09-25", type: "alert", title: "Research Lab budget warning", detail: "87% of monthly budget used", projectId: "prj_03" },
  { id: "act_02", date: "2026-09-22", type: "limit", title: "Support Copilot limit updated", detail: "Monthly limit raised to $650", projectId: "prj_02" },
  { id: "act_03", date: "2026-09-18", type: "alert", title: "Unusual usage spike detected", detail: "Production API usage increased", projectId: "prj_01", keyId: "key_1" },
  { id: "act_04", date: "2026-09-12", type: "key", title: "Research Lab test key created", detail: "New API key added", projectId: "prj_03", keyId: "key_6" },
  { id: "act_05", date: "2026-09-05", type: "limit", title: "Production API limit updated", detail: "Monthly limit raised to $1,200", projectId: "prj_01" },
  { id: "act_06", date: "2026-09-01", type: "top-up", title: "Credits added", detail: "25,000 credits added by Visa •••• 4242" },
  { id: "act_07", date: "2026-08-29", type: "alert", title: "Low balance resolved", detail: "Balance returned to a healthy level" },
  { id: "act_08", date: "2026-08-01", type: "top-up", title: "Credits added", detail: "20,000 credits added by Visa •••• 4242" },
  { id: "act_09", date: "2026-07-01", type: "top-up", title: "Credits added", detail: "20,000 credits added by Visa •••• 4242" },
];
export const invoices: Invoice[] = Array.from({ length: 6 }, (_, i) => ({ id: `inv_${i + 1}`, number: `INV-2026-${String(9 - i).padStart(3, "0")}`, date: `2026-${String(9 - i).padStart(2, "0")}-01`, amount: [1487, 1324, 1198, 1056, 978, 842][i] ?? 0, status: i === 0 ? "pending" : "paid" }));

// Stable 90-day fixture ending Sep 26, 2026. Weekends dip and Sep 18 has a deliberate spike.
export const usageEvents: UsageEvent[] = Array.from({ length: 90 }, (_, day) => {
  const date = new Date(Date.UTC(2026, 5, 29 + day));
  const dateString = date.toISOString().slice(0, 10);
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const spike = dateString === "2026-09-18" ? 2.8 : 1;
  return projects.flatMap((project, projectIndex) => Array.from({ length: 3 }, (_, slot) => {
    const model = models[(day + projectIndex * 2 + slot) % models.length] ?? { id: "gpt-4o", inputPerMillion: 2.5, outputPerMillion: 10 };
    const rhythm = 1 + .16 * Math.sin(day * .47 + projectIndex) + .08 * Math.cos(day * .91 + slot);
    const inputTokens = Math.round((1200000 + projectIndex * -199200 + slot * 292800) * (weekend ? .42 : 1) * rhythm * spike);
    const outputTokens = Math.round(inputTokens * (model.id === "text-embedding-3" ? 0 : .39 + slot * .07));
    return { id: `evt_${day}_${projectIndex}_${slot}`, date: dateString, inputTokens, outputTokens, cost: Number(((inputTokens * model.inputPerMillion + outputTokens * model.outputPerMillion) / 1000000).toFixed(4)), modelId: model.id, projectId: project.id, keyId: apiKeys[projectIndex * 2 + (slot % 2)]?.id ?? "", userId: teamMembers[(day + slot + projectIndex) % teamMembers.length]?.id ?? "", endpoint: ["/v1/chat/completions", "/v1/responses", "/v1/embeddings"][model.id === "text-embedding-3" ? 2 : slot % 2] ?? "/v1/responses" };
  }));
}).flat();
export const dailyUsage = Array.from({ length: 90 }, (_, index) => {
  const events = usageEvents.slice(index * 12, index * 12 + 12);
  return { date: events[0]?.date ?? "", inputTokens: events.reduce((sum, event) => sum + event.inputTokens, 0), outputTokens: events.reduce((sum, event) => sum + event.outputTokens, 0), cost: Number(events.reduce((sum, event) => sum + event.cost, 0).toFixed(2)) };
});
