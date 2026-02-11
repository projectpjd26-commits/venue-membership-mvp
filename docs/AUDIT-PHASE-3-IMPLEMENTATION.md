# Quick audit — Phase 3 implementation

Use this for sign-off and Vercel verification.

---

## 1. Schema (Phase 3D)

**Migration:** `supabase/migrations/20250211140000_memberships_status_verification_result.sql`

| Check | Status | Notes |
|-------|--------|--------|
| CHECK on `memberships.status` | ✅ | `CHECK (status IN ('active','grace','expired','revoked','pending'))` |
| `verification_events.result` includes `expired` | ✅ | `CHECK (result IN ('valid','invalid','expired'))` |
| UNIQUE (user_id, venue_id) unchanged | ✅ | No change; still from `20250209120000_domain_tables.sql` |
| **Migration does NOT recreate table** | ✅ | Only `ALTER TABLE ... DROP CONSTRAINT IF EXISTS` and `ADD CONSTRAINT`; no `CREATE TABLE` |
| **No ALTER TYPE** | ✅ | No `ALTER TYPE`; constraints only on existing `text` columns |
| **Indexes still intact** | ✅ | No index changes; `idx_memberships_stripe_subscription_id` etc. untouched |

**Conclusion:** Safe to run in production.

---

## 2. Verification surface (Phase 3B)

| Check | Status | Notes |
|-------|--------|--------|
| Standalone layout, no dashboard wrapper | ✅ | `app/verify/layout.tsx`; route not under `app/dashboard/` |
| Deterministic state model | ✅ | Server returns `result: "VALID" \| "EXPIRED" \| "INVALID"` |
| Debounce via cookie | ✅ | `verify_last_at` cookie; 1s rate limit |
| result enum mapping | ✅ | Audit table stores `'valid' \| 'invalid' \| 'expired'` |
| last scan logic | ✅ | `lastVerifiedAt` from `verification_events`; "Last scan X min ago" when valid |
| **UI does NOT use raw DB status** | ✅ | UI only uses `result.result` (VALID/EXPIRED/INVALID). Raw `status` and `expires_at` are used only server-side in `resolveMembershipResult()` to compute the API result; verify-form never sees DB fields. |

**Conclusion:** Clean; UI strictly maps via result enum.

---

## 3. Demo isolation (Phase 3C)

| Check | Status | Notes |
|-------|--------|--------|
| `IS_DEMO_MODE` env flag | ✅ | `src/lib/constants.ts` |
| `isDemoMode()` | ✅ | `return process.env.IS_DEMO_MODE === "true"` |
| `requireDemoAdmin()` gates when !demo | ✅ | Returns 404 when `!isDemoMode()` |
| **Vercel production:** Is `IS_DEMO_MODE` set? | ⬜ **Verify manually** | **If unset → defaults to false → demo routes disabled. That is correct for production.** Do not set `IS_DEMO_MODE=true` in production. |

**Conclusion:** Architecture is correct. Confirm in Vercel project env that `IS_DEMO_MODE` is **not** set (or is explicitly `false`) for production.

---

## 4. Manual verification checklist

- [ ] Run migration in target env; confirm no errors and no table recreate.
- [ ] In Vercel → Project → Settings → Environment Variables: production has no `IS_DEMO_MODE` or `IS_DEMO_MODE=false`.
- [ ] As staff, open `/verify`; paste payload or use `?user_id=...`; confirm VALID/EXPIRED/INVALID and "Last scan …" when applicable.
- [ ] With `IS_DEMO_MODE` unset, hit `/internal/demo` → should redirect to `/`. Demo-reset/demo-grant should 404.
