-- Phase 3D: Structural guarantees for memberships and verification audit.
-- Idempotent: drop constraint if exists then add.

-- A. Memberships: restrict status to canonical set (no arbitrary strings).
ALTER TABLE public.memberships
  DROP CONSTRAINT IF EXISTS memberships_status_check;

ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('active', 'grace', 'expired', 'revoked', 'pending'));

-- B. Verification events: allow 'expired' result for audit (VALID / EXPIRED / INVALID).
ALTER TABLE public.verification_events
  DROP CONSTRAINT IF EXISTS verification_events_result_check;

ALTER TABLE public.verification_events
  ADD CONSTRAINT verification_events_result_check
  CHECK (result IN ('valid', 'invalid', 'expired'));

COMMENT ON CONSTRAINT memberships_status_check ON public.memberships IS 'Canonical membership state; UI maps to ACTIVE/GRACE/EXPIRED/REVOKED/PENDING';
COMMENT ON CONSTRAINT verification_events_result_check ON public.verification_events IS 'Audit result: valid, invalid, or expired membership';
