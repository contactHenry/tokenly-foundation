# Tokenly Foundation

Build the foundation for "Tokenly", a SaaS dashboard for managing AI token usage, credits, spending, and limits. Use React, Tailwind, shadcn/ui, Recharts, and lucide-react. Do not build feature pages yet.

DESIGN DIRECTION: very clean, modern, calm, friendly. Think Linear x Stripe Dashboard. Data-dense but never cluttered.
- Font: Inter. Use tabular numbers (font-variant-numeric: tabular-nums) for all figures.
- Neutral base: white/zinc-50 surfaces, zinc-200 borders, zinc-900 text, zinc-500 secondary text.
- One accent: indigo-600 (#4F46E5), used only for primary actions, active states, and the main chart series.
- Semantic colors, used only for meaning: emerald (healthy), amber (warning), rose (critical).
- 8px spacing grid, 12px card radius, 1px borders instead of heavy shadows, generous whitespace.
- Light and dark mode via CSS variables, with a toggle.
- Chart palette: max 5 muted colors derived from indigo plus neutrals.

APP SHELL:
- Collapsible left sidebar: Overview, Usage, Projects & Keys, Limits & Alerts, Billing, Activity, Settings. Workspace switcher at the top, user menu at the bottom.
- Top bar: page title, global date-range picker (Today, 7d, 30d, 90d, Custom), notification bell with a badge, and "Top up credits" primary button.
- Placeholder routes for every nav item.

REUSABLE COMPONENTS (build a /design-system page showcasing each one):
StatCard (label, value, delta, sparkline, status), StatusBadge, ProgressBar with threshold markers, DataTable (sortable, sticky header, row click), FilterBar with chips, EmptyState, Skeleton loaders, AlertBanner (info/warning/critical), ChartCard (title, legend, timeframe, actions menu), Drawer for detail views.

MOCK DATA: create a typed mock data layer (/lib/mock) with: organization, 4 projects, 8 API keys, 6 models (e.g. GPT-4o, Claude Sonnet, Llama 3, embeddings), 90 days of daily usage events (tokens in/out, cost, model, project, key, user), credit balance of 42,000 with top-up history, budgets per project, 5 alerts, 6 invoices, 5 team members with roles. Make usage realistic, with weekday patterns and one spike.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa919902-da7f-4250-a876-cb80fb00392e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
