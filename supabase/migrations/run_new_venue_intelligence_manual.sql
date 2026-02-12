-- Run this in Supabase Dashboard → SQL Editor if "db push" fails due to migration order.
-- (Project → SQL Editor → New query → paste this file → Run.)
-- Adds: venue intelligence views, device_id, realtime, membership_lifetime_visits, venue_daily_hourly_scans.

-- 1. Venue intelligence views
CREATE OR REPLACE VIEW public.venue_daily_scans AS
SELECT
  venue_id,
  date_trunc('day', occurred_at) AS day,
  count(*)::int AS total_scans,
  count(*) FILTER (WHERE result = 'valid')::int AS approved_scans,
  count(*) FILTER (WHERE result IN ('invalid', 'expired'))::int AS denied_scans
FROM public.verification_events
GROUP BY venue_id, date_trunc('day', occurred_at');

COMMENT ON VIEW public.venue_daily_scans IS 'Daily scan totals per venue; approved = valid, denied = invalid/expired.';

CREATE OR REPLACE VIEW public.venue_tier_usage AS
SELECT
  m.venue_id,
  m.tier,
  count(e.id)::int AS total_scans
FROM public.verification_events e
JOIN public.memberships m ON m.id = e.membership_id
GROUP BY m.venue_id, m.tier;

COMMENT ON VIEW public.venue_tier_usage IS 'Scan count by tier per venue.';

CREATE OR REPLACE VIEW public.member_visit_frequency AS
SELECT
  membership_id AS member_id,
  count(*)::int AS visits,
  max(occurred_at) AS last_visit
FROM public.verification_events
WHERE result = 'valid'
GROUP BY membership_id;

COMMENT ON VIEW public.member_visit_frequency IS 'Approved visits per membership.';

-- 2. device_id + Realtime
ALTER TABLE public.verification_events
  ADD COLUMN IF NOT EXISTS device_id text NULL;

COMMENT ON COLUMN public.verification_events.device_id IS 'Optional device identifier for scan.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'verification_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_events;
  END IF;
END $$;

-- 3. Membership lifetime visits
CREATE OR REPLACE VIEW public.membership_lifetime_visits AS
SELECT
  membership_id,
  count(*)::int AS lifetime_visits
FROM public.verification_events
WHERE result = 'valid'
GROUP BY membership_id;

COMMENT ON VIEW public.membership_lifetime_visits IS 'Lifetime approved scans per membership.';

-- 4. Peak-hour / heatmap view
CREATE OR REPLACE VIEW public.venue_daily_hourly_scans AS
SELECT
  venue_id,
  (occurred_at AT TIME ZONE 'UTC')::date AS day,
  extract(hour FROM (occurred_at AT TIME ZONE 'UTC'))::int AS hour,
  count(*)::int AS total_scans
FROM public.verification_events
WHERE result = 'valid'
GROUP BY venue_id, (occurred_at AT TIME ZONE 'UTC')::date, extract(hour FROM (occurred_at AT TIME ZONE 'UTC'));

COMMENT ON VIEW public.venue_daily_hourly_scans IS 'Valid scans per venue per day (UTC) and hour. For heatmap and peak-hour intelligence.';
