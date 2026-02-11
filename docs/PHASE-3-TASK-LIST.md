# Phase 3 task list — statuses

Aligned with the “designed vs current reality” review. Use this for handoff and sprint planning.

**Legend:** ⬜ Not started · 🔄 In progress · ✅ Done · ⏸ Blocked

---

## 1. Membership state (UI abstraction)

| Task | Status | Notes |
|------|--------|--------|
| **1.1** Create `getMembershipDisplayState(membership)` returning `{ state, label, badgeColor, canVerify, showRenewal }` | ✅ | `src/lib/membership-display-state.ts` |
| **1.2** Use display state everywhere in UI (dashboard, venue members list, pass) — no raw `status`/`tier`/`expires_at` for labels | ✅ | Dashboard + venue members list use it; pass can follow |
| **1.3** Document state derivation rules (grace window, “canceled but active until”, etc.) in code or docs | ⬜ | |

---

## 2. Verification hardening

| Task | Status | Notes |
|------|--------|--------|
| **2.1** Verification page: remove nav chrome; dark neutral background; single-purpose scan | ✅ | app/verify/layout + standalone page |
| **2.2** Giant state banner: GREEN VALID / RED INVALID / ORANGE EXPIRED (deterministic, large type) | ✅ | Deep green / dark orange / dark red |
| **2.3** Secondary metadata small: Tier, Last scan, Venue | ✅ | Tier, venue, verifiedAt, lastVerifiedAt |
| **2.4** Record and show scan timestamp on verify screen | ✅ | verifiedAt + Verified at ... |
| **2.5** Last-seen scan indicator for fraud (e.g. “Last scan: 2 min ago” when valid) | ✅ | Last scan X min ago when lastVerifiedAt |
| **2.6** Rate limit verification attempts per staff session or IP (or short debounce) | ✅ | 1s debounce via cookie |

---

## 3. Venue theming isolation

| Task | Status | Notes |
|------|--------|--------|
| **3.1** Formal `venue.theme` schema (e.g. CSS vars or token keys in DB) | ⬜ | Migration + types |
| **3.2** Controlled Tailwind token mapping from theme | ⬜ | No ad-hoc hex in components |
| **3.3** Guaranteed layout preservation under branding | ⬜ | Regression guard |

---

## 4. Observability

| Task | Status | Notes |
|------|--------|--------|
| **4.1** Structured error logging surfaced to Admin (or log drain) | ⬜ | |
| **4.2** Stripe → membership reconciliation UI (Admin) | ⬜ | “Resync subscription” or list desyncs |
| **4.3** Webhook failure visibility (stripe_webhook_events status = error) | ⬜ | Admin or internal page |
| **4.4** Edge retry / replay visibility | ⬜ | |
| **4.5** Membership row audit / diff view | ⬜ | Nice-to-have |

---

## 5. Production vs demo separation

| Task | Status | Notes |
|------|--------|--------|
| **5.1** Env flag `IS_DEMO_MODE=true` (or `ALLOW_DEMO_ROUTES=true`) | ✅ | `isDemoMode()` in `src/lib/constants.ts` |
| **5.2** When not demo: disable demo reset, demo grant, internal demo route | ✅ | `requireDemoAdmin()` returns 404 when !isDemoMode(); admin/join hide UI |
| **5.3** Hide or 404 `/internal/demo` when not demo mode | ✅ | Redirect to `/` when !isDemoMode() |
| **5.4** Remove fallback venues in production (or make fallback list env-driven) | ✅ | `getFallbackVenues()` returns pilots only when !isDemoMode() |

---

## 6. Database constraints (memberships)

| Task | Status | Notes |
|------|--------|--------|
| **6.1** `UNIQUE (user_id, venue_id)` | ✅ | Already in `20250209120000_domain_tables.sql` |
| **6.2** Tier ENUM or CHECK constraint | ✅ | `CHECK (tier IN ('supporter', 'vip', 'founder'))` |
| **6.3** Status ENUM or CHECK constraint (`active`, `expired`, `revoked`, `grace`, `pending`) | ✅ | `20250211140000_memberships_status_verification_result.sql` |
| **6.4** `expires_at NOT NULL` when status = active (CHECK or trigger) | ⬜ | Optional; demo grants may leave null |

---

## 7. Reconciliation and errors

| Task | Status | Notes |
|------|--------|--------|
| **7.1** Manual reconciliation endpoint (e.g. Admin “Resync subscription” → call Stripe, update membership row) | ⬜ | Prevents silent Stripe ↔ Supabase desync |
| **7.2** Error boundary UX: clean fallback page, “Membership status pending confirmation”, log to audit | ⬜ | |

---

## 8. Venue owner experience

| Task | Status | Notes |
|------|--------|--------|
| **8.1** Dedicated route `/venue/[slug]` for venue owner experience (separate from member dashboard) | ⬜ | Long-term: blended dashboard confuses operators |
| **8.2** Member dashboard remains `/dashboard` (memberships, activity) | ✅ | Current behavior |

---

## Summary

- **Done:** 6.1, 6.2, 8.2  
- **In progress:** 1.1  
- **Next recommended:** 1.2, 2.1–2.2, 5.1–5.2, 6.3, 7.1  

Use this file as the single Phase 3 checklist; update status as work completes.
