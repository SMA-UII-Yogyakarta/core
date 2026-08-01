# Contributing

Thank you for contributing! Please read this guide and the linked documents before
opening your first pull request — most rejected PRs come from a couple of preventable
mistakes documented below.

## Repository layout

- **Backend**: Laravel 13 (PHP 8.4). Source in `app/`, routes in `routes/`, tests in `tests/`.
- **Frontend**: React + TypeScript + Inertia + Tailwind. Source in `resources/js/`.
- **CI**: `.github/workflows/tests.yml` runs Pint, PHPStan, PHPUnit and the frontend
  checks on every push/PR to `main` and `develop`.

## Getting started

The project is developed with [lerd](https://github.com/lerd/lerd) (see
`docs/lerd-onboarding.md`). For a fresh local setup:

```bash
composer setup   # installs deps, copies .env, generates key, migrates, builds assets
```

The standard dev loop:

```bash
composer dev     # php artisan serve + queue + log:tail + vite, concurrently
```

## Code conventions

The team convention is **English-first for all code**, regardless of language:

- File names, identifiers, route URLs, prop/state keys and code comments: English.
- UI labels the user sees (e.g. "Nama Siswa", "Kelas") may stay Indonesian.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- One logical feature = one commit.

See `docs/pr-workflow-guide.md` for the full set of conventions and the branch/rebase
workflow, and `docs/development-workflow.md` for the wider team guide.

## Quality gates

Run these before pushing. CI enforces the same checks.

```bash
./vendor/bin/pint --test          # code style
./vendor/bin/phpstan analyse --memory-limit=2G   # static analysis (level 5)
php artisan test                  # PHPUnit suite
bun run lint                      # eslint
bun run build                     # tsc + vite build
```

## Opening a pull request

1. Branch from the **latest** `upstream/develop` — never from an old local branch:
   `git fetch upstream && git checkout -b feat/my-feature upstream/develop`.
2. Keep the PR to a single logical change with a conventional-commit title.
3. Fill in `.github/PULL_REQUEST_TEMPLATE.md` (applied automatically) and tick every
   checklist item.
4. If the PR reports conflicts, rebase (not merge) and `git push --force-with-lease`.

## Reporting issues

Use the GitHub issue templates. Include the Laravel log output (if applicable), steps to
reproduce, and what you expected instead.
