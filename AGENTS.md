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
