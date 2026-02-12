-- Pilot upgrade: lifetime approved visits per membership (for member cards / "Lifetime Visits: 23").

CREATE OR REPLACE VIEW public.membership_lifetime_visits AS
SELECT
  membership_id,
  count(*)::int AS lifetime_visits
FROM public.verification_events
WHERE result = 'valid'
GROUP BY membership_id;

COMMENT ON VIEW public.membership_lifetime_visits IS 'Lifetime approved scans per membership. Join to memberships for member cards.';
