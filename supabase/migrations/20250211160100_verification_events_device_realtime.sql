-- Optional device_id for "device used" in demos; enable Realtime for live dashboard.

ALTER TABLE public.verification_events
  ADD COLUMN IF NOT EXISTS device_id text NULL;

COMMENT ON COLUMN public.verification_events.device_id IS 'Optional device identifier for scan (e.g. tablet, kiosk).';

-- Enable Realtime for verification_events so dashboard can subscribe to INSERTs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'verification_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_events;
  END IF;
END $$;
