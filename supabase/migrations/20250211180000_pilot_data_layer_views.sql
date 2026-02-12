-- Pilot data layer: staff metrics, fraud ratios, membership utilization, revenue attribution.
-- All views are safe to query; dashboard uses them with venue_id filter.

-- 1. Staff verification metrics (per venue, per staff: totals + rates)
CREATE OR REPLACE VIEW public.venue_staff_verification_metrics AS
SELECT
  venue_id,
  staff_user_id,
  count(*)::int AS total_scans,
  count(*) FILTER (WHERE result = 'valid')::int AS valid_count,
  count(*) FILTER (WHERE result IN ('invalid', 'expired'))::int AS invalid_count,
  count(*) FILTER (WHERE flag_reason IS NOT NULL)::int AS flagged_count,
  round(
    (count(*) FILTER (WHERE result IN ('invalid', 'expired'))::numeric / nullif(count(*)::numeric, 0)) * 100,
    1
  ) AS invalid_ratio_pct,
  round(
    (count(*) FILTER (WHERE flag_reason IS NOT NULL)::numeric / nullif(count(*)::numeric, 0)) * 100,
    1
  ) AS flagged_ratio_pct
FROM public.verification_events
GROUP BY venue_id, staff_user_id;

COMMENT ON VIEW public.venue_staff_verification_metrics IS 'Per-venue, per-staff: scan counts and invalid/flagged ratios for dashboard.';

-- 2. Fraud / invalid scan ratios (per venue, per day)
CREATE OR REPLACE VIEW public.venue_scan_fraud_ratios AS
SELECT
  venue_id,
  date_trunc('day', occurred_at)::date AS day,
  count(*)::int AS total_scans,
  count(*) FILTER (WHERE result = 'valid')::int AS approved_scans,
  count(*) FILTER (WHERE result IN ('invalid', 'expired'))::int AS denied_scans,
  count(*) FILTER (WHERE flag_reason IS NOT NULL)::int AS flagged_scans,
  round(
    (count(*) FILTER (WHERE result IN ('invalid', 'expired'))::numeric / nullif(count(*)::numeric, 0)) * 100,
    1
  ) AS invalid_ratio_pct,
  round(
    (count(*) FILTER (WHERE flag_reason IS NOT NULL)::numeric / nullif(count(*)::numeric, 0)) * 100,
    1
  ) AS flagged_ratio_pct
FROM public.verification_events
GROUP BY venue_id, date_trunc('day', occurred_at);

COMMENT ON VIEW public.venue_scan_fraud_ratios IS 'Per-venue, per-day: total, approved, denied, flagged and their ratios.';

-- 3. Membership utilization (per venue: how many members scanned in last 7 days)
CREATE OR REPLACE VIEW public.venue_membership_utilization AS
SELECT
  v.id AS venue_id,
  (SELECT count(*)::int FROM public.memberships m WHERE m.venue_id = v.id) AS total_members,
  (SELECT count(DISTINCT e.membership_id)::int
   FROM public.verification_events e
   WHERE e.venue_id = v.id AND e.result = 'valid' AND e.occurred_at >= now() - interval '7 days'
  ) AS members_with_scan_7d,
  round(
    (SELECT count(DISTINCT e.membership_id)::numeric
     FROM public.verification_events e
     WHERE e.venue_id = v.id AND e.result = 'valid' AND e.occurred_at >= now() - interval '7 days'
    ) / nullif((SELECT count(*)::numeric FROM public.memberships m WHERE m.venue_id = v.id), 0) * 100,
    1
  ) AS utilization_7d_pct
FROM public.venues v;

COMMENT ON VIEW public.venue_membership_utilization IS 'Per-venue: total members, members with at least one valid scan in last 7d, utilization %.';

-- 4. Revenue attribution by tier (from venue_transactions; tier from membership or 'no_membership')
CREATE OR REPLACE VIEW public.venue_revenue_by_tier AS
SELECT
  t.venue_id,
  coalesce(m.tier, 'no_membership') AS tier,
  coalesce(sum(t.amount_cents), 0)::bigint AS revenue_cents,
  count(*)::int AS tx_count
FROM public.venue_transactions t
LEFT JOIN public.memberships m ON m.id = t.membership_id
GROUP BY t.venue_id, coalesce(m.tier, 'no_membership');

COMMENT ON VIEW public.venue_revenue_by_tier IS 'Per-venue, per-tier: revenue_cents and transaction count. Overlay for revenue attribution.';
