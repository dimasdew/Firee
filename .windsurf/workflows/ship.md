---
description: Build, commit, and push changes to production
---

# Ship Workflow

## Step 1: Quality Check
// turbo
```bash
npm run build 2>&1 | tail -35
```
Must exit 0.

## Step 2: Review Changes
// turbo
```bash
git diff --stat
```
Review what files changed and ensure nothing unexpected.

## Step 3: Stage and Commit
```bash
git add -A && git status --short
```
Review staged files. Commit with conventional commit message:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `chore:` for maintenance

## Step 4: Push
```bash
git push origin main
```

## Step 5: Post-Push Verification
Confirm push succeeded. Check Vercel deployment if applicable.
