# Pull Request Workflow — Contributor Guide

> Target audience: all contributors, especially first-time ones (e.g. Fathan/Hans02-Neo).
> If you have ever seen a PR that contains commits you did **not** author, or a PR full of
> merge/rename commits, you are in the right place — read this before your next PR.

---

## 1. Why PRs end up wrong

Two mistakes cause almost every broken PR on this repo:

### Mistake A — Branching from a stale fork copy

When you fork the repo once and then keep creating branches from your fork's old `develop`,
your PR does **not** contain just your work. It contains every commit from the old upstream
history that is missing on `main` — which looks like "I am adding 30 commits I didn't write".

**Rule:** never branch from your fork's old `develop`. Always branch from the **latest**
`upstream/develop`.

### Mistake B — Indonesian file names / code identifiers

The team convention is **English-first** for all *code*:

- File names: `resources/js/Pages/Admin/MonthlyRecap.tsx` (not `RekapBulanan.tsx`)
- Route URLs: `/admin/monthly-recap` (not `/admin/rekap-bulanan`)
- Type/prop/state keys: `verified_present`, `late`, `sick_permit` (not `hadir_terdata`, `terlambat`)
- Code comments, identifiers, commit messages: English

UI **labels** the user sees (e.g. "Nama Siswa", "Kelas", "HADIR") may stay Indonesian —
the app is Indonesian-facing. But everything a developer reads (names, keys, routes, types)
is English. When in doubt, match what is already in `develop`.

---

## 2. Correct workflow (step by step)

### 2.1. One-time fork setup

```bash
# your fork is `origin`, the team repo is `upstream`
git remote add upstream git@github.com:SMA-UII-Yogyakarta/core.git
git fetch upstream
```

### 2.2. Before starting a feature — always rebase from fresh upstream

```bash
git fetch upstream
git checkout -b feat/my-feature upstream/develop   # start from the LATEST develop
```

Never `git checkout -b` from your old local `develop` or `main`.

### 2.3. Commit — one commit per feature

```bash
git add <files>
git commit -m "feat: short english summary of what changed"
```

- One logical feature = one commit. Do **not** merge upstream into your branch to "sync" —
  that pollutes the PR. Rebase instead (2.5).
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

### 2.4. Push and open the PR

```bash
git push origin feat/my-feature
# open PR: base = upstream:develop, head = your fork:feat/my-feature
```

The PR title/description in English. The PR commit list should show **only your commit(s)**.

### 2.5. When the PR shows "This branch has conflicts"

```bash
git fetch upstream
git rebase upstream/develop
# resolve conflicts, then:
git add <resolved files>
git rebase --continue
git push --force-with-lease origin feat/my-feature
```

`--force-with-lease` (never plain `--force`) overwrites the remote branch after rebase.

---

## 3. Pre-push checklist (validated on real PR #13 bugs)

- [ ] Branch created from `upstream/develop` (fresh).
- [ ] PR contains only my commits.
- [ ] File names English, match the current `resources/js` tree (run `git ls-files resources/js/Pages`).
- [ ] Route URLs match `routes/web.php` / `routes/api.php`. Test each link you render
      (`git grep -n 'router.get(' resources/js` and hit every route).
- [ ] Prop/state keys match the **backend controller** that renders the page
      (open the matching controller, e.g. `app/Http/Controllers/Web/DashboardController.php`,
      and copy the exact keys it passes).
- [ ] No dead buttons — every `<button>`/`<a>` has a working `onClick`/`href`.
- [ ] No hardcoded user/identity data (e.g. `username="Ahmad Reza Pahlevi"`).
- [ ] No misuse of React hooks (`useState` must not be used as an effect — use `useEffect`).
- [ ] `bun run build` (tsc + vite) passes with strict TypeScript.
- [ ] `composer test` / `vendor/bin/pint` pass.

---

## 4. Reference

- `docs/development-workflow.md` — full team development guide
- `docs/WORKFLOW-FRONTEND-BACKEND.md` — contract-first frontend↔backend workflow
- `docs/07-git-workflow-submodule.md` (in `SMA-UII-Yogyakarta/aksesekolah`) — git flow basics
