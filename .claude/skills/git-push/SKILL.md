---
name: git-push
description: >
  Automates the full git push workflow: creates a new branch from the current branch,
  commits all changes, pushes to origin, and opens a pull request toward `main`.
  Use this skill whenever the user says "push", "git push", "fă push", "trimite pe GitHub",
  "deschide un PR", "push origin", "creează un branch și fă push", or any variation that
  implies they want their local changes published and reviewed. Also trigger when the user
  asks to "share changes", "open a pull request", or "push to remote". Trigger even if the
  user doesn't say /git-push explicitly — if they want their work pushed and a PR opened,
  this skill handles it end to end.
---

# git-push skill

Automates: new branch → commit → push → pull request toward `main`.

## What this skill does

1. Inspects the current branch and uncommitted changes
2. Generates a short branch name (max 5 words, kebab-case) that describes the changes
3. Creates the new branch from the current branch's HEAD
4. Stages all changes and commits with a meaningful message
5. Pushes the branch to `origin`
6. Opens a pull request toward `main` using `gh` (GitHub CLI)

## Step-by-step workflow

### Step 1 — Understand what changed

Run these to get the full picture:
```bash
git status --short
git diff --stat HEAD
git log --oneline -5
```

Read the diff to understand what the changes are about. This informs both the branch name and the commit message.

### Step 2 — Generate branch name and commit message

**Branch name rules:**
- Max 5 words, all lowercase, separated by hyphens (`-`)
- Describes the content of the changes, not the action (e.g., `add-supplier-dropdown` not `make-changes`)
- No special characters, no slashes
- If there's already a good branch name (e.g., `feat/123-something`), keep using it and skip to Step 3

**Commit message rules:**
- One concise line summarizing what changed and why
- Format: `type: short description` (e.g., `feat: add supplier dropdown to product form`)
- Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`

**Examples:**
- Changes: new Supplier entity + Angular form field → branch: `add-supplier-feature`, commit: `feat: add supplier entity and product form dropdown`
- Changes: fix null pointer in mapper → branch: `fix-mapper-null-check`, commit: `fix: handle null supplier in ProductMapper`
- Changes: update flyway migration → branch: `update-flyway-migration`, commit: `chore: add V2 flyway migration for suppliers table`

### Step 3 — Create the new branch

```bash
git checkout -b <branch-name>
```

If this fails because the branch already exists:
```bash
git checkout <branch-name>
```

### Step 4 — Stage and commit

Stage all changes:
```bash
git add -A
```

Then commit:
```bash
git commit -m "<commit message>"
```

If the commit is blocked by a pre-commit hook failure, read the hook output, fix the underlying issue, re-stage, and retry the commit. Never use `--no-verify`.

### Step 5 — Push to origin

```bash
git push -u origin <branch-name>
```

### Step 6 — Open a pull request

Check if `gh` is available:
```bash
gh --version
```

**If `gh` is available**, open the PR:
```bash
gh pr create \
  --title "<commit message summary>" \
  --base main \
  --body "$(cat <<'EOF'
## Summary
<2-3 bullet points describing what changed>

## Test plan
- [ ] Tests pass locally
- [ ] Manually verified feature works

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**If `gh` is NOT available**, print the remote URL so the user can open the PR manually:
```bash
git remote get-url origin
```
Then tell the user: "Push succeeded. To open a PR, go to: `<remote-url>/compare/<branch-name>?expand=1` and set the base branch to `main`."

Also offer: "You can install GitHub CLI with `winget install --id GitHub.cli` (Windows) or `brew install gh` (Mac) to automate PR creation in the future."

### Step 7 — Report back

Tell the user:
- The branch name that was created
- The commit message used
- Whether the PR was opened (and the PR URL if yes) or the manual URL to open it

## Error handling

| Situation | Action |
|---|---|
| Nothing to commit (clean working tree) | Tell the user there are no changes to push |
| Branch name collision | Append a short suffix: `add-supplier-feature-2` |
| Push rejected (non-fast-forward) | Run `git pull --rebase origin <branch>` then retry push |
| Pre-commit hook fails | Fix the issue, re-stage, retry — never skip hooks |
| `gh pr create` fails (already exists) | Run `gh pr view --web` to open the existing PR |
| Not in a git repository | Tell the user and stop |
