<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Tokenly uses a shared TanStack root shell with leaf routes and a typed deterministic mock layer; this keeps navigation consistent while feature pages remain placeholders.
- Tokenly's UI palette is centralized in src/styles.css semantic tokens; this keeps light and dark modes coherent.
- Usage analysis derives grouped figures from the deterministic mock events, keeps shareable filters in the URL, and stores named views on the current device; this provides a consistent no-login preview without creating account data.
- Projects & Keys changes (new projects, keys, revocations) are saved on the current device only; why: the preview has no accounts yet.
- Limits & Alerts budgets, rule settings and alert statuses are saved on the current device only; why: the preview has no accounts yet.
- Billing (balance, top-ups, auto-recharge, cards, invoice status) and workspace settings/team/role preview live in device-only stores (tokenly-billing-v1, tokenly-workspace-v1); why: no accounts or payment provider yet.
- Permissions come from ROLE_PERMS in workspace-store; gate actions with <Gate perm> so denied actions render disabled with a tooltip; why: one source of truth for role-aware UI.
- Icons come from src/components/icons.tsx (Phosphor regular/bold line icons behind lucide-style names), never directly from an icon package. Icons appear in navigation, metric cards and buttons (add/create actions lead with Plus); section headers and list rows stay text-only, and IconTile renders nothing unless `plain`; why: a quiet, professional monochrome UI.
- Corner radii follow the brand scale in src/styles.css (rounded-sm/md 6px controls, lg/xl 12px cards and popovers, 2xl 16px dialogs, 3xl 24px hero); dots, avatars, toggles and progress bars stay rounded-full; page headers use <PageHeader>; why: one consistent shape and page identity.
- The palette is monochrome (black, white, neutral greys) in src/styles.css: white page, light-grey sidebar, selected nav item solid black with white text and white line icons; status is shown by fill weight (StatusBadge), never hue. The only hue is the sky-blue chart ramp (--chart-1…5, --chart-fill) for data. Don't introduce other coloured hex values; the logo is <Logo>/<LogoMark> from src/components/tokenly/logo.tsx; why: one unified black-and-white look in light and dark mode.
