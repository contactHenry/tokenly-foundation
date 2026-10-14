# Tokenly

Tokenly is a dashboard for teams that spend money on AI models. It shows token usage, credits,
spend and budgets in one place. It also lets a workspace manage projects, API keys, alert rules,
billing and team roles.

> **Status: front-end preview.** Every screen works, but there is no backend yet. Usage comes from
> a deterministic mock data set. Anything you change (projects, keys, budgets, top-ups, team
> members) is saved in your browser's `localStorage`, on this device only. See
> [What's not real yet](#whats-not-real-yet) before demoing or deploying.

- **Live editor:** [Lovable project](https://lovable.dev/projects/aa919902-da7f-4250-a876-cb80fb00392e)
- **Roadmap and open issues:** [`roadmap.md`](roadmap.md)
- **Rules for agents and contributors:** [`AGENTS.md`](AGENTS.md)

---

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Conventions](#conventions)
- [Working with Lovable](#working-with-lovable)
- [Quality checks](#quality-checks)
- [What's not real yet](#whats-not-real-yet)

## Features

| Area                | What it does                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Overview**        | Credit balance, burn rate, runway and period spend. Lists what needs attention, a spend trend with forecast, top consumers and recent activity.                                |
| **Usage**           | Filter by model, project, key, user and token type, with filters kept in the URL so views can be shared. Includes grouped tables, a detail drawer, CSV export and saved views. |
| **Projects & Keys** | Project cards with budget health. Create, rotate and revoke keys; the full secret is shown once, then only the last 4 characters are kept.                                     |
| **Limits & Alerts** | Budgets for the organisation, a project or a key, set up in a 5-step drawer with a live projection. Also covers alert rules (channels and recipients) and alert history.       |
| **Billing**         | Balance and runway, top-ups with bonus tiers, auto-recharge (validated), payment methods, invoices and a credit ledger.                                                        |
| **Activity**        | Audit timeline with filters and a detail drawer.                                                                                                                               |
| **Settings**        | Workspace details, team invites and roles, a permission matrix, notification preferences, and Slack and webhook integrations.                                                  |
| **Everywhere**      | Light and dark mode, Ctrl/⌘ + K quick search, a notification centre, previewing the app as another role, and a new-account setup checklist.                                    |

## Quick start

**You need:** Node.js 22+. Bun is optional.

```sh
git clone https://github.com/contactHenry/tokenly-foundation.git
cd tokenly-foundation
npm install          # see the note below about bun
npm run dev          # http://localhost:8080
```

**About the lockfile:**

- `bun.lock` is managed by Lovable, and some of its entries point at Lovable's private package
  mirror.
- Outside Lovable, `bun install` may fail with `403` errors. Use `npm install` instead.
- Don't commit a `package-lock.json`. The lockfile Lovable uses is `bun.lock`.

**No environment setup is needed** to run the preview. `.env` only holds _publishable_ Supabase
values for future use. Never put a secret key (for example a service-role key) in that file:
it is committed, and `VITE_*` values are bundled into the client.

**If the dev server fails with `EAFNOSUPPORT ::`**, your machine has no IPv6. Run
`npx vite dev --host 127.0.0.1`.

## Scripts

| Command             | Purpose                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`       | Starts the dev server with hot reload and SSR.                                       |
| `npm run build`     | Production build. Output goes to `.output/`, built for Cloudflare Workers via Nitro. |
| `npm run build:dev` | Development-mode build, which is easier to debug.                                    |
| `npm run preview`   | Serves the production build locally.                                                 |
| `npm run lint`      | Runs ESLint, with Prettier enforced as a lint rule.                                  |
| `npm run format`    | Formats the codebase with Prettier.                                                  |
| `npx tsc --noEmit`  | Type check in strict mode, including `exactOptionalPropertyTypes`.                   |

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) with React 19. It provides SSR,
  type-safe file-based routing and URL search params validated per route.
- **Build:** Vite, through `@lovable.dev/vite-tanstack-config`, plus Nitro. The default
  deploy target is Cloudflare Workers.
- **UI:**
  - Tailwind CSS v4, with design tokens defined in CSS.
  - [shadcn/ui](https://ui.shadcn.com) components built on Radix.
  - Recharts for charts.
  - [Phosphor](https://phosphoricons.com) icons.
  - `cmdk` for quick search and `sonner` for toasts.
- **State:**
  - Small hand-written stores built on `useSyncExternalStore`, saved to `localStorage`.
  - TanStack Query is installed for when real APIs arrive.
- **Planned backend:** Supabase, through a Lovable Cloud integration. The client code is under
  `src/integrations/supabase/`, but nothing calls it yet.

## Architecture

```text
┌─────────────────────────── __root.tsx (HTML shell, theme script, error boundaries) ─┐
│  AppShell: sidebar · top bar (search, date range, theme, notifications, top-up)     │
│  ┌──────────────── route (src/routes/*.tsx) ────────────────┐                       │
│  │  PageHeader + feature view (src/components/tokenly/*)    │                       │
│  └───────────────┬──────────────────────────┬───────────────┘                       │
└──────────────────┼──────────────────────────┼───────────────────────────────────────┘
                   │ reads                    │ reads / writes (guarded by role)
        ┌──────────▼──────────┐    ┌──────────▼───────────────────────────────┐
        │ src/lib/mock        │    │ device stores (localStorage, per browser)│
        │ deterministic data: │    │ projects · limits · billing · workspace  │
        │ 90 days of usage,   │    │ restoreState() validates the stored shape│
        │ projects, keys, ... │    │ guarded() re-checks permissions per call │
        └─────────────────────┘    └──────────────────────────────────────────┘
```

**Routes are thin.** Each file in `src/routes/` declares its `head()` metadata, validates its search
params, and renders a view from `src/components/tokenly/`. The global date range lives in
`AppShell` and is read with `useDateRange()`.

**Mock data is deterministic.** `src/lib/mock` builds 90 days of usage (ending 2026-09-26) from
fixed formulas, with no randomness. As a result, every reload, screenshot and server render
shows the same numbers. Derived figures (grouping, trends, forecasts) are computed from these
events. They are never stored.

**There are four device stores:** `projects-store`, `limits-store`, `billing-store` and
`workspace-store`. Each one:

- starts from mock seed data, and saves to a versioned key (for example `tokenly-billing-v1`);
- loads saved data through `restoreState()`, which only accepts fields whose shape matches the
  seed, so corrupt storage falls back to defaults instead of crashing a page;
- wraps its actions in `guarded()`, so every write re-checks the active role.

The same pattern will carry over to a real API by swapping the store bodies for API calls.

**Permissions** come from one place: `ROLE_PERMS` in `workspace-store.ts`.

| Layer           | How it works                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| UI              | `<Gate perm>` or `useRole().can(perm)` disables controls the role can't use, and shows a tooltip explaining why.                      |
| Store           | `guarded()` blocks the action and shows a toast, even if a button forgot to check.                                                    |
| Role preview    | "Preview as role" can only _narrow_ your permissions. Only an Owner can grant or remove the Owner role.                               |
| Server (future) | **Not yet built.** Client checks only improve the experience. They are not security. Every rule must be enforced again on the server. |

## Project structure

```text
src/
├── routes/                 # One file per URL (see src/routes/README.md)
│   └── __root.tsx          # HTML shell, global head, theme bootstrap, error / 404 pages
├── components/
│   ├── icons.tsx           # The only icon import point (Phosphor, lucide-style names)
│   ├── tokenly/            # Product code
│   │   ├── app-shell.tsx   # Sidebar, top bar, date range context
│   │   ├── nav.ts          # Pages: label, route, icon, tone, description
│   │   ├── primitives.tsx  # PageHeader, IconTile, StatCard, DataTable, EmptyState, ...
│   │   ├── *-view.tsx      # Feature screens (usage, projects, limits, billing, ...)
│   │   ├── *-store.ts      # Device stores (see Architecture)
│   │   ├── storage.ts      # restoreState(): shape-checked localStorage restore
│   │   ├── theme.ts        # Dark mode hook and setter
│   │   └── command-menu.tsx# Ctrl/⌘ + K quick search
│   └── ui/                 # shadcn/ui components (restyled through tokens; edit sparingly)
├── lib/mock/               # Deterministic mock data layer
├── integrations/supabase/  # Generated by Lovable Cloud (not used yet)
├── styles.css              # Design tokens: colour, radius, shadow, tones (light + dark)
├── server.ts / start.ts    # SSR entry, error and CSRF middleware
└── routeTree.gen.ts        # Generated: never edit by hand
```

## Design system

The look aims to be calm, modern and friendly, in the spirit of Linear and Stripe: dense with
data but never cluttered. Everything visual comes from tokens in `src/styles.css`, defined for
both light and dark mode.

- **Colour:** near-neutral surfaces with one indigo accent. Success, warning and critical colours
  are used only to signal meaning.
- **Tones:** seven soft accents (indigo, sky, violet, amber, emerald, rose, slate) give each page
  and section an identity through `IconTile`.
- **Shape:** every corner radius is **4px**. All `rounded-*` steps resolve to `--radius`.
  Radio buttons are the one exception and stay circular.
- **Surfaces:** cards use the `surface` utility (1px border, very light shadow). Popovers and
  dialogs use `--shadow-raised`.
- **Type:** Inter with optical sizing and tabular numbers, so figures line up.
- **Icons:**
  - Always import from `@/components/icons`. Use the two-tone style for content and the bold
    style for small controls.
  - Add a new icon to that file rather than importing an icon package directly.
- **Motion:** 150–300 ms transitions, switched off when the user prefers reduced motion.

You can browse the components live at **`/design-system`**.

## Conventions

The short version of [`AGENTS.md`](AGENTS.md):

1. **Theming.** Use semantic tokens (`bg-card`, `text-muted-foreground`, `bg-tone-sky-soft`, and
   so on). Never use raw colours or hard-coded radii.
2. **Page headers.** Start every page with `<PageHeader>`, using the page's entry in `nav.ts`.
3. **Mutations.** Any action that changes data goes through a store action wrapped in `guarded()`.
   Gate its control in the UI as well.
4. **Saved data.** Anything read from `localStorage` goes through `restoreState()`. Wrap writes in
   `try/catch`, because storage can be full or blocked.
5. **URL params.** Validate them in the route's `validateSearch`. Never trust a hand-edited link.
6. **Formatting.** Prettier formats everything (`printWidth: 100`). Comments explain _why_,
   not _what_.

## Working with Lovable

This repository is two-way synced with Lovable. **`main` is the synced branch.**

- Commits merged into `main` show up in the Lovable editor, and edits made in Lovable are
  committed to `main`.
- **Never rewrite published history.** No force-pushing, and no rebasing or squashing
  commits that are already pushed: Lovable's project history would be lost.
- Keep `main` deployable. Do work on a branch, open a pull request, and merge once
  `tsc`, the lint check and the build pass.
- `vite.config.ts` already includes React, Tailwind, path aliases and Nitro. Don't add them again.

## Quality checks

Run these before opening a pull request:

```sh
npx tsc --noEmit && npm run lint && npm run build
```

There is no automated test suite yet. Until there is, check changes in a browser:

- every route in light and dark mode, and at mobile width (390px);
- the app as a **Finance viewer** (user menu → Preview as role), to confirm restricted controls
  are disabled;
- a hand-edited URL such as `/usage?to=x`, which must not crash.

## What's not real yet

| Gap                                        | Consequence                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| No authentication or accounts              | Anyone with the URL sees the demo workspace.                                 |
| Data is mock data and device-only          | Changes don't sync between browsers and disappear when site data is cleared. |
| Permissions are checked in the client only | They must be enforced on the server before any real data exists.             |
| No payment provider                        | Top-ups, cards and invoice retries are simulated.                            |
| No security headers or CSP yet             | Add them in `src/server.ts` before a public launch.                          |
| Preview build                              | Marked `noindex`, and `robots.txt` blocks crawlers. Remove both at launch.   |

Specific follow-ups (budget pickers, the audit log of your own actions, dead controls, and
more) are tracked in [`roadmap.md`](roadmap.md#review-follow-ups-open-loopholes).
