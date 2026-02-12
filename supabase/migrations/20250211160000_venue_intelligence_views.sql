-- Venue intelligence: views over verification_events for sales/demo.
-- Scans = verification_events. approved = result 'valid', denied = 'invalid' or 'expired'.

-- 1. Daily traffic per venue (today: 127 verifications)
CREATE OR REPLACE VIEW public.venue_daily_scans AS
SELECT
  venue_id,
  date_trunc('day', occurred_at) AS day,
  count(*)::int AS total_scans,
  count(*) FILTER (WHERE result = 'valid')::int AS approved_scans,
  count(*) FILTER (WHERE result IN ('invalid', 'expired'))::int AS denied_scans
FROM public.verification_events
GROUP BY venue_id, date_trunc('day', occurred_at');

COMMENT ON VIEW public.venue_daily_scans IS 'Daily scan totals per venue; approved = valid, denied = invalid/expired. For "Today: N verifications".';

-- 2. Tier usage per venue (VIP vs Standard breakdown)
CREATE OR REPLACE VIEW public.venue_tier_usage AS
SELECT
  m.venue_id,
  m.tier,
  count(e.id)::int AS total_scans
FROM public.verification_events e
JOIN public.memberships m ON m.id = e.membership_id
GROUP BY m.venue_id, m.tier;

COMMENT ON VIEW public.venue_tier_usage IS 'Scan count by tier per venue. For "VIP members account for 42% of visits".';

-- 3. Member visit frequency (repeat visitors, last visit)
CREATE OR REPLACE VIEW public.member_visit_frequency AS
SELECT
  membership_id AS member_id,
  count(*)::int AS visits,
  max(occurred_at) AS last_visit
FROM public.verification_events
WHERE result = 'valid'
GROUP BY membership_id;

COMMENT ON VIEW public.member_visit_frequency IS 'Approved visits per membership. For "Top 10 most active members" and last visit.';
