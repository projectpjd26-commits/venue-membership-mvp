# Quality Control & Bug Fixes Report

**Date:** January 18, 2026  
**Review Status:** Complete  
**Overall Assessment:** ⚠️ Code requires critical fixes before production

---

## 🔴 CRITICAL ISSUES (Production Blockers)

### 1. Analytics API - Nested Query Bug
**File:** `src/app/api/analytics/venue/route.ts` (Line ~116)  
**Severity:** HIGH - Will cause runtime errors  
**Issue:** Nested async call inside `.in()` query will fail

```typescript
// ❌ BROKEN CODE
const { count: totalReferrals } = await supabase
  .from('referrals')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed')
  .in(
    'referrer_id',
    (await supabase.from('members').select('id')...) as any  // ❌ Nested async
  );
```

**Fix:**
```typescript
// ✅ FIXED CODE
// First fetch venue member IDs
const { data: venueMembers } = await supabase
  .from('members')
  .select('id')
  .eq('venue_id', venueId);

const venueMemberIds = venueMembers?.map((m) => m.id) || [];

// Then get referral count
const { count: totalReferrals } = await supabase
  .from('referrals')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed')
  .in('referrer_id', venueMemberIds);
```

---

### 2. Missing Authentication on Sensitive Endpoints
**Severity:** CRITICAL - Security vulnerability  
**Impact:** Anyone can access/modify data without authentication

**Affected Endpoints:**
- `/api/visits/track` - Anyone can track visits for any member
- `/api/analytics/venue` - No venue ownership verification  
- `/api/wallet/generate` - No auth check before generating passes
- `/api/stripe/checkout` - No user validation

**Required Fix:** Create authentication middleware

```typescript
// src/middleware.ts or src/lib/auth/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function requireAuth(request: Request) {
  const supabase = createServerClient(...);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return { session, user: session.user };
}
```

---

### 3. Wallet Pass Generation - Incomplete Implementation
**File:** `src/app/api/wallet/generate/route.ts`  
**Severity:** HIGH - Feature doesn't work as intended  
**Issue:** Returns raw JSON instead of signed wallet passes

**Current:** Returns JSON data structure  
**Expected:** Returns downloadable `.pkpass` (Apple) and signed JWT (Google)

**Missing Components:**
- Apple Wallet pass signing with certificates
- Manifest.json generation
- Pass bundle ZIP creation
- Google Wallet JWT signing

**Recommended Action:**
- Document as Phase 2 feature, OR
- Implement using `passkit-generator` (Apple) and Google Wallet API

---

## 🟡 HIGH PRIORITY ISSUES

### 4. Visit Tracking - Race Condition
**File:** `src/app/api/visits/track/route.ts`  
**Severity:** MEDIUM - Data integrity issue  
**Issue:** Member stats update fails silently if error occurs

```typescript
// ❌ PROBLEM
const { error: updateError } = await supabase
  .from('members')
  .update({ visit_count: newVisitCount })
  .eq('id', memberId);

if (updateError) {
  console.error('Member update error:', updateError);
  // ❌ Visit is already recorded but member stats not updated!
}
```

**Fix:** Use database transactions or return error
```typescript
if (updateError) {
  // Rollback or return error
  return NextResponse.json(
    { error: 'Failed to update member stats', details: updateError.message },
    { status: 500 }
  );
}
```

---

### 5. Database - Circular RLS Policy
**File:** `supabase/migrations/001_initial_schema.sql` (Line ~180)  
**Severity:** MEDIUM - Security misconfiguration  
**Issue:** Venue staff policy always returns true

```sql
-- ❌ BROKEN POLICY
CREATE POLICY "Venue staff can view their venue's members" ON members
  FOR SELECT USING (
    venue_id IN (
      SELECT v.id FROM venues v
      WHERE v.id = venue_id  -- ❌ This always returns true!
    )
  );
```

**Fix:** Need proper role-based access or venue ownership table

---

### 6. Missing Database Indexes
**Severity:** MEDIUM - Performance issue  
**Impact:** Slow analytics queries at scale

**Required Indexes:**
```sql
-- Add to new migration file
CREATE INDEX idx_visits_venue_date ON visits(venue_id, visit_date);
CREATE INDEX idx_members_venue_status ON members(venue_id, status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id, status);
CREATE INDEX idx_visits_member_date ON visits(member_id, visit_date DESC);
```

---

## 🟢 CODE QUALITY ISSUES

### 7. No Input Validation
**Severity:** LOW - Code quality  
**Recommendation:** Add Zod schemas for all API endpoints

```typescript
import { z } from 'zod';

const visitSchema = z.object({
  memberId: z.string().uuid(),
  venueId: z.string().uuid(),
  transactionAmount: z.number().optional()
});

// In API route
const body = visitSchema.parse(await request.json());
```

---

### 8. Type Safety Issues
**Files:** Multiple  
**Issues:**
- Using `any` type in analytics query
- No TypeScript interfaces for API request/response
- Missing type exports

**Fix:** Create `src/types/api.ts`
```typescript
export interface CreateVisitRequest {
  memberId: string;
  venueId: string;
  transactionAmount?: number;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: {
    overview: {...};
    distributions: {...};
  };
}
```

---

### 9. Hardcoded Stripe API Version
**File:** `src/app/api/stripe/checkout/route.ts`  
**Issue:** Using outdated API version `'2023-10-16'`

**Fix:** Use latest version or pull from environment variable
```typescript
apiVersion: process.env.STRIPE_API_VERSION || '2024-11-20',
```

---

## ✅ COMPLETED FIXES

1. ✅ **Environment Variables Documented** - Updated `.env.example` with all required variables
2. ✅ **Supabase Helpers Created** - `client.ts` and `server.ts` exist and configured properly

---

## 📋 IMPLEMENTATION CHECKLIST

### Immediate (Before Production)
- [ ] Fix analytics nested query bug (30 min)
- [ ] Add authentication middleware (2-3 hours)
- [ ] Fix visit tracking error handling (30 min)
- [ ] Update RLS policies for venue access (1 hour)
- [ ] Add performance indexes migration (15 min)

### Short Term (Week 1)
- [ ] Add input validation with Zod (2-3 hours)
- [ ] Create TypeScript type definitions (1 hour)
- [ ] Implement error logging (Sentry) (1 hour)
- [ ] Update Stripe API version (15 min)
- [ ] Add API rate limiting (1-2 hours)

### Medium Term (Phase 2)
- [ ] Implement wallet pass signing OR document limitation
- [ ] Add comprehensive unit tests
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Implement caching layer (Redis)
- [ ] Add monitoring dashboards

---

## 🎯 PRIORITY RANKING

**P0 (Deploy Blocker):**
1. Fix analytics nested query
2. Add authentication to all endpoints
3. Fix visit tracking race condition

**P1 (Launch Week):**
4. Add database indexes
5. Fix RLS policies
6. Add input validation

**P2 (Post-Launch):**
7. Type safety improvements
8. Wallet pass implementation
9. Testing & documentation

---

## 📊 CODE METRICS

- **Total Files Reviewed:** 12
- **Critical Bugs Found:** 3
- **High Priority Issues:** 3  
- **Code Quality Issues:** 3
- **Estimated Fix Time:** 8-10 hours

---

## ✨ POSITIVE FINDINGS

✅ **Well-structured database schema** with proper relationships  
✅ **Comprehensive feature set** - All core functionality implemented  
✅ **Consistent error handling** patterns across endpoints  
✅ **Good separation of concerns** - API routes organized logically  
✅ **Modern tech stack** - Next.js 14, Supabase, TypeScript

---

**Reviewer Notes:**  
The codebase has a solid foundation. The main issues are authentication gaps and a few critical bugs that will cause runtime errors. With 8-10 hours of focused development, this system can be production-ready. The database design is particularly strong.

**Recommended Next Step:** Address P0 items first (analytics bug, authentication), then proceed with deployment to staging for integration testing.
