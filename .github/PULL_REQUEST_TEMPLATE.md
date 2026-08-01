## Summary

<!-- What does this PR do, and why? One or two sentences. English. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] refactor — code change that does not change behaviour
- [ ] docs — documentation only
- [ ] chore — tooling, CI, dependencies, housekeeping

## Checklist

- [ ] Branch created from the **latest `upstream/develop`** (not from an old local `develop`).
- [ ] PR contains **only my commits** (no merge/rename commits, no upstream history).
- [ ] Conventional commit message, one logical feature = one commit.
- [ ] File names, route URLs, and prop/state keys are **English** and match the current
      `develop` tree (see `docs/pr-workflow-guide.md`).
- [ ] Prop/state keys match the backend controller that renders the page.
- [ ] No dead buttons — every button/link has a working handler.
- [ ] No hardcoded user/identity data.
- [ ] No misuse of React hooks.

## Verification

- [ ] `vendor/bin/pint --test`
- [ ] `vendor/bin/phpstan analyse --memory-limit=2G`
- [ ] `php artisan test`
- [ ] `bun run lint` (eslint)
- [ ] `bun run build` (tsc + vite)

## Screenshots (if UI change)

<!-- Add screenshots here. -->

## Related issues / PRs

<!-- Reference any issues or prior PRs. -->
