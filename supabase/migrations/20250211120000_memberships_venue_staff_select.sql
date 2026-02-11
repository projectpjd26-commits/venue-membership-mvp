-- Allow venue_staff to SELECT memberships at their venue(s) so they can show a members list on the dashboard.
-- Existing policy memberships_select_own (user_id = auth.uid()) stays; policies are OR'd for SELECT.

DROP POLICY IF EXISTS "memberships_select_venue_staff" ON public.memberships;
CREATE POLICY "memberships_select_venue_staff"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venue_staff vs
      WHERE vs.venue_id = memberships.venue_id AND vs.user_id = auth.uid()
    )
  );
