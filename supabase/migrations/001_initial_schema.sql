-- Coteri Membership System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  square_location_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  tier VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(50) DEFAULT 'active',
  visit_count INTEGER DEFAULT 0,
  total_spend DECIMAL(10, 2) DEFAULT 0.00,
  referral_code VARCHAR(50) UNIQUE,
  referred_by UUID REFERENCES members(id),
  last_visit_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- Visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_amount DECIMAL(10, 2) DEFAULT 0.00,
  square_transaction_id VARCHAR(255),
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership tiers table
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_interval VARCHAR(20) DEFAULT 'monthly',
  stripe_price_id VARCHAR(255),
  benefits JSONB DEFAULT '[]',
  max_guests INTEGER DEFAULT 0,
  priority_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, slug)
);

-- Perks/Rewards table
CREATE TABLE perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  value JSONB,
  required_tier VARCHAR(50),
  required_visits INTEGER DEFAULT 0,
  expiration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member perks (redeemed/earned)
CREATE TABLE member_perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  perk_id UUID REFERENCES perks(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (for venue shows/performances)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  door_time TIMESTAMP WITH TIME ZONE,
  ticket_price DECIMAL(10, 2),
  member_discount_percent INTEGER DEFAULT 0,
  max_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event reservations
CREATE TABLE event_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  num_guests INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'confirmed',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals tracking
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES members(id) ON DELETE CASCADE,
  referred_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  reward_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_venue_id ON members(venue_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_tier ON members(tier);
CREATE INDEX idx_visits_member_id ON visits(member_id);
CREATE INDEX idx_visits_venue_id ON visits(venue_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_reservations_event_id ON event_reservations(event_id);
CREATE INDEX idx_event_reservations_member_id ON event_reservations(member_id);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members
CREATE POLICY "Members can view their own data" ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Venue staff can view their venue's members" ON members
  FOR SELECT USING (
    venue_id IN (
      SELECT v.id FROM venues v
      WHERE v.id = venue_id
    )
  );

-- RLS Policies for visits
CREATE POLICY "Members can view their own visits" ON visits
  FOR SELECT USING (
    member_id IN (
      SELECT m.id FROM members m WHERE m.user_id = auth.uid()
    )
  );

-- RLS Policies for public venue data
CREATE POLICY "Anyone can view active venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active tiers" ON membership_tiers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active perks" ON perks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view upcoming events" ON events
  FOR SELECT USING (status = 'upcoming');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_tiers_updated_at BEFORE UPDATE ON membership_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perks_updated_at BEFORE UPDATE ON perks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_reservations_updated_at BEFORE UPDATE ON event_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
