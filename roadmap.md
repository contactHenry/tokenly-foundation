# Tokenly Overview and Usage
- [x] Replace Overview with status → cause → action hierarchy and responsive 12-column layout.
- [x] Add range-aware spending, runway, forecast, consumers, attention, and activity from mock data.
- [x] Make attention actions and consumer filters carry context to relevant pages.
- [x] Verify range changes, actions, loading state, chart, and mobile presentation.
- [x] Build Usage filters, saved views, summary, chart, grouped table, drawer, and CSV export.
- [x] Verify shareable URL filters and Usage drill-down end-to-end.
- [x] Build Projects & Keys: project grid, detail tabs, keys table, create/revoke/rotate flows.
- [x] Build Limits & Alerts: budgets, 5-step budget drawer with live projection, alert rules, alert history.
- [x] Build Billing: balance, top-up modal, auto-recharge, plan & pricing, payment methods, invoices, ledger.
- [x] Build Activity audit timeline with filters and detail drawer.
- [x] Build notification center popover (All/Unread/Alerts, mark all read, source links).
- [x] Build Settings tabs: General, Team (invite, roles matrix), Notifications, Integrations.
- [x] Role-aware UI: Finance viewer sees Billing/Usage, key management disabled with tooltips.
- [ ] Polish: mobile (drawer nav, 2x2→1 stat cards, table→card lists <768px, readable chart axes).
- [ ] Polish: loading / empty (with next action) / error (retry) states on every data view.
- [x] Polish: new-account onboarding checklist (Create project → API key → budget).
- [x] Polish: 150–200ms transitions, stat count-up, row hover, toasts for every action.
- [ ] Polish: WCAG AA contrast, focus rings, keyboard tables/drawers, status icons + labels.
- [ ] Polish: consistent spacing, $1,240.50 / 1.2M formatting, relative dates, button hierarchy.

# Review follow-ups (open loopholes)
- [ ] Budget pickers list only mock projects/keys; use the projects store (skip revoked keys) and sync the project budget with the limits-store budget.
- [ ] Activity log shows only mock events; record real actions (top-ups, key create/rotate/revoke, budget and team changes).
- [ ] Duplicate names allowed for projects, keys and budgets on the same target/period.
- [ ] Hard-coded dates: new keys/top-ups dated 2026-09-26, "resets Oct 1", workspace timezone setting unused.
- [ ] Dead controls: "Change plan" link, `action=inspect-spike` ignored, "View key" opens /projects without selecting the key.
- [ ] Webhook signing secret is a fixed demo value with no rotate; webhook URLs need server-side SSRF checks once real.
- [ ] Card form accepts expired dates and has no Luhn check.
- [ ] Before real accounts: enforce every permission on the server (client checks are UX only), add security headers/CSP in src/server.ts, stop committing `.env`.
