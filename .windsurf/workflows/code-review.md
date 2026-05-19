---
description: Review code quality, security, and performance before committing
---

# Code Review Workflow

## Step 1: Search Strategy (Priority Order)
1. **Grep** (exact pattern) → for known symbols/strings
2. **Find** (file discovery) → for finding modules by name
3. **Read** (full file) → only after locating the right file
4. **code_search** (broad) → last resort for complex queries

Never guess file contents — always read first.

## Step 2: Security Checks
- [ ] No hardcoded API keys, secrets, or tokens
- [ ] No `.env` values committed
- [ ] Input validation on all user-facing forms
- [ ] SQL injection prevention (use parameterized queries via Supabase)
- [ ] XSS prevention (React auto-escapes, but check `dangerouslySetInnerHTML`)
- [ ] Auth checks on protected routes (AuthGuard)
- [ ] CORS and redirect URL validation

## Step 3: Code Quality
- [ ] No `any` types (use proper TypeScript types)
- [ ] No unused imports or variables
- [ ] Early returns over deep nesting
- [ ] Consistent naming (camelCase for variables, PascalCase for components)
- [ ] No duplicate code — extract shared logic into utils/hooks
- [ ] Error handling with user-friendly messages (showToast)

## Step 4: Performance
- [ ] No unnecessary re-renders (check useCallback/useMemo usage)
- [ ] Images optimized (Next.js Image component)
- [ ] No blocking operations on main thread
- [ ] Lazy loading for heavy components
- [ ] Bundle size check: `npm run build` output

## Step 5: Consistency
- [ ] "Login" (not "Sign in") for authentication
- [ ] "Register" (not "Sign up") for account creation
- [ ] Protected routes use AuthGuard
- [ ] Landing page CTAs → /login (not /dashboard)
- [ ] All text consistent across pages

## Step 6: Build Verification
// turbo
```bash
npm run build 2>&1 | tail -35
```
Build must exit 0 with no errors.
