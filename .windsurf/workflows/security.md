---
description: Security audit checklist for the Firee web application
---

# Security Audit Workflow

## Step 1: Authentication & Authorization
- [ ] All protected pages use AuthGuard
- [ ] Supabase RLS (Row Level Security) enabled on all tables
- [ ] API calls check user authentication before mutations
- [ ] Password validation enforced (lowercase, uppercase, number, special char, min 6)
- [ ] OAuth redirect URLs properly configured

## Step 2: Input Validation
- [ ] Email validation on auth forms
- [ ] File upload size limits enforced
- [ ] Price inputs sanitized (parseFloat, not eval)
- [ ] No user input directly in SQL/queries (Supabase handles this)
- [ ] Form data validated before submission

## Step 3: Client-Side Security
- [ ] No secrets in client-side code (NEXT_PUBLIC_ only for public keys)
- [ ] No sensitive data in localStorage (only non-critical UI state)
- [ ] Wallet private keys never touched by our code
- [ ] Signed URLs with expiry for file downloads

## Step 4: Smart Contract Security
- [ ] Contract verified on BaseScan
- [ ] Reentrancy guards on withdrawal functions
- [ ] Proper access control (onlyOwner for admin functions)
- [ ] USDC approve/transferFrom pattern correct
- [ ] Platform fee calculation correct (no rounding exploits)

## Step 5: Infrastructure
- [ ] Environment variables not committed to git
- [ ] Supabase service key only used server-side
- [ ] CORS properly configured
- [ ] Rate limiting on sensitive endpoints
