-- Performance Indexes Migration
-- Improves query performance for analytics and high-traffic endpoints

-- Composite index for venue-based analytics queries
-- Speeds up queries filtering by venue_id and visit_date
CREATE INDEX IF NOT EXISTS idx_visits_venue_date 
  ON visits(venue_id, visit_date DESC);

-- Composite index for member status queries
-- Optimizes member list queries filtered by venue and status
CREATE INDEX IF NOT EXISTS idx_members_venue_status 
  ON members(venue_id, status);

-- Index for referral analytics
-- Improves referral counting and tracking queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status 
  ON referrals(referrer_id, status);

-- Index for member visit history
-- Speeds up member-specific visit queries (ordered by date)
CREATE INDEX IF NOT EXISTS idx_visits_member_date 
  ON visits(member_id, visit_date DESC);

-- Index for transaction amount queries
-- Optimizes revenue and spend analytics
CREATE INDEX IF NOT EXISTS idx_visits_amount 
  ON visits(venue_id, transaction_amount) 
  WHERE transaction_amount > 0;

-- Index for tier-based member queries
-- Improves queries filtering members by tier
CREATE INDEX IF NOT EXISTS idx_members_tier 
  ON members(venue_id, tier, created_at DESC);

-- Index for event reservations
-- Speeds up event check-in and attendance queries
CREATE INDEX IF NOT EXISTS idx_event_reservations_event_status 
  ON event_reservations(event_id, status);

-- Index for member perks
-- Optimizes perk redemption queries
CREATE INDEX IF NOT EXISTS idx_member_perks_status 
  ON member_perks(member_id, status, expires_at);
