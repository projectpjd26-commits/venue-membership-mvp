-- Peak-hour intelligence: scans by day and hour (UTC) for heatmap and "peak scan times".

CREATE OR REPLACE VIEW public.venue_daily_hourly_scans AS
SELECT
  venue_id,
  (occurred_at AT TIME ZONE 'UTC')::date AS day,
  extract(hour FROM (occurred_at AT TIME ZONE 'UTC'))::int AS hour,
  count(*)::int AS total_scans
FROM public.verification_events
WHERE result = 'valid'
GROUP BY venue_id, (occurred_at AT TIME ZONE 'UTC')::date, extract(hour FROM (occurred_at AT TIME ZONE 'UTC'));

COMMENT ON VIEW public.venue_daily_hourly_scans IS 'Valid scans per venue per day (UTC date) and hour (0-23). For heatmap and peak-hour intelligence.';
