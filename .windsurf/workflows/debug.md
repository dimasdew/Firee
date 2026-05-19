---
description: Systematic debugging approach for finding and fixing issues
---

# Debug Workflow

## Step 1: Reproduce
- Identify the exact steps to reproduce the bug
- Note the expected vs actual behavior
- Check browser console for errors

## Step 2: Locate Root Cause
1. Search for error message in codebase
2. Trace the data flow from source to output
3. Check recent commits that may have introduced the issue
4. Read relevant files completely before making assumptions

## Step 3: Verify Before Fixing
- Add console.log or temporary logging to confirm the issue location
- Never fix symptoms — always fix root cause
- Prefer minimal upstream fixes over downstream workarounds

## Step 4: Fix
- Make the smallest possible change that fixes the issue
- Single-line fix if sufficient — avoid over-engineering
- Preserve existing code style and patterns

## Step 5: Verify Fix
// turbo
```bash
npm run build 2>&1 | tail -20
```
Build must pass. Test the fix manually or describe verification steps.

## Step 6: Check for Regressions
- Did the fix break anything else?
- Are there similar patterns elsewhere that need the same fix?
- Search for the same pattern: `grep -rn "pattern" --include="*.tsx" .`
