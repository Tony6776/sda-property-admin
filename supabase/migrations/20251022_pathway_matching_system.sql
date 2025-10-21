-- =====================================================
-- SDA PATHWAY MATCHING SYSTEM - CLEAN VERSION
-- Drop existing incomplete tables and recreate
-- =====================================================

-- Drop existing tables (if they exist in incomplete state)
DROP TABLE IF EXISTS calendar_bookings CASCADE;
DROP TABLE IF EXISTS automated_reports CASCADE;
DROP TABLE IF EXISTS investor_opportunities CASCADE;
DROP TABLE IF EXISTS property_matches CASCADE;
DROP TABLE IF EXISTS social_media_leads CASCADE;
DROP TABLE IF EXISTS conversion_properties CASCADE;

-- Update existing tables with new columns
DO $$
BEGIN
  -- Add pathway fields to participants table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'pathway_preference') THEN
    ALTER TABLE participants ADD COLUMN pathway_preference TEXT CHECK (pathway_preference IN ('deposit_ready', 'rent_to_buy', 'equity_share', 'standard_tenant'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'deposit_amount') THEN
    ALTER TABLE participants ADD COLUMN deposit_amount DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'saved_deposit_progress') THEN
    ALTER TABLE participants ADD COLUMN saved_deposit_progress DECIMAL(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'sda_service_agreement_signed') THEN
    ALTER TABLE participants ADD COLUMN sda_service_agreement_signed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'agreement_value') THEN
    ALTER TABLE participants ADD COLUMN agreement_value DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'agreement_signed_date') THEN
    ALTER TABLE participants ADD COLUMN agreement_signed_date DATE;
  END IF;

  -- Add pathway fields to investors table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'pathway_preferences') THEN
    ALTER TABLE investors ADD COLUMN pathway_preferences TEXT[] DEFAULT ARRAY['standard_rental']::TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'min_hold_period') THEN
    ALTER TABLE investors ADD COLUMN min_hold_period INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'equity_stake_interest') THEN
    ALTER TABLE investors ADD COLUMN equity_stake_interest BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'conversion_interest') THEN
    ALTER TABLE investors ADD COLUMN conversion_interest BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add fields to properties table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'visible_on_channel_agent_site') THEN
    ALTER TABLE properties ADD COLUMN visible_on_channel_agent_site BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'conversion_property') THEN
    ALTER TABLE properties ADD COLUMN conversion_property BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'total_cost') THEN
    ALTER TABLE properties ADD COLUMN total_cost DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'conversion_cost_estimate') THEN
    ALTER TABLE properties ADD COLUMN conversion_cost_estimate DECIMAL(12,2);
  END IF;
END $$;

-- Create conversion_properties table
CREATE TABLE conversion_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  property_address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'townhouse', 'unit')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  purchase_price DECIMAL(12,2) NOT NULL,
  conversion_cost_estimate DECIMAL(12,2) NOT NULL,
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (purchase_price + conversion_cost_estimate) STORED,
  conversion_breakdown JSONB,
  established_area_score INTEGER CHECK (established_area_score BETWEEN 1 AND 10),
  sda_suitability_score INTEGER CHECK (sda_suitability_score BETWEEN 1 AND 10),
  overall_conversion_score INTEGER CHECK (overall_conversion_score BETWEEN 0 AND 100),
  confirmed_participant_demand INTEGER DEFAULT 0,
  interested_investors_count INTEGER DEFAULT 0,
  source_listing_id TEXT,
  source_platform TEXT,
  listing_url TEXT,
  images JSONB,
  status TEXT DEFAULT 'scanned' CHECK (status IN ('scanned', 'matched', 'investor_interested', 'under_contract', 'converted', 'not_suitable')),
  scanned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create property_matches table
CREATE TABLE property_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  conversion_property_id UUID REFERENCES conversion_properties(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('deposit_ready', 'rent_to_buy', 'equity_share', 'standard_tenant')),
  investor_role TEXT CHECK (investor_role IN ('full_owner', 'equity_stake', 'none')),
  ai_match_score INTEGER CHECK (ai_match_score BETWEEN 0 AND 100),
  match_reasoning TEXT,
  settlement_date DATE,
  equity_split JSONB,
  projected_roi JSONB,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'sent', 'participant_confirmed', 'investor_confirmed', 'contract_signed', 'rejected')),
  sent_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT property_or_conversion_required CHECK (
    (property_id IS NOT NULL AND conversion_property_id IS NULL) OR
    (property_id IS NULL AND conversion_property_id IS NOT NULL)
  )
);

-- Create investor_opportunities table
CREATE TABLE investor_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  conversion_property_id UUID REFERENCES conversion_properties(id) ON DELETE CASCADE,
  property_match_id UUID REFERENCES property_matches(id) ON DELETE SET NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('standard_rental', 'rent_to_buy_pathway', 'equity_share_pathway', 'conversion_opportunity')),
  roi_projection JSONB NOT NULL,
  investment_required DECIMAL(12,2) NOT NULL,
  confirmed_participants_count INTEGER DEFAULT 0,
  participant_ids UUID[],
  ai_match_score INTEGER CHECK (ai_match_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'hot_buy_sent', 'eoi_received', 'interested', 'inspection_booked', 'offer_made', 'declined', 'expired')),
  hot_buy_report_sent_at TIMESTAMP,
  eoi_received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  CONSTRAINT property_or_conversion_required_investor CHECK (
    (property_id IS NOT NULL AND conversion_property_id IS NULL) OR
    (property_id IS NULL AND conversion_property_id IS NOT NULL)
  )
);

-- Create automated_reports table
CREATE TABLE automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  report_type TEXT NOT NULL CHECK (report_type IN ('sda_property_report', 'investor_hot_buy', 'pathway_comparison', 'roi_projection')),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  property_match_id UUID REFERENCES property_matches(id) ON DELETE SET NULL,
  investor_opportunity_id UUID REFERENCES investor_opportunities(id) ON DELETE SET NULL,
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  email_subject TEXT,
  email_body TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  sent_to_email TEXT,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'opened', 'clicked', 'responded', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT participant_or_investor_required CHECK (
    (participant_id IS NOT NULL AND investor_id IS NULL) OR
    (participant_id IS NULL AND investor_id IS NOT NULL)
  )
);

-- Create social_media_leads table
CREATE TABLE social_media_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  source_type TEXT NOT NULL CHECK (source_type IN ('facebook_group', 'ndis_referral', 'website_form', 'instagram', 'linkedin')),
  source_details JSONB,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('participant', 'investor', 'landlord', 'general_inquiry')),
  raw_content TEXT,
  extracted_data JSONB NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  processed BOOLEAN DEFAULT FALSE,
  participant_id UUID REFERENCES participants(id),
  investor_id UUID REFERENCES investors(id),
  landlord_id UUID REFERENCES landlords(id),
  captured_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create calendar_bookings table
CREATE TABLE calendar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL DEFAULT 'homelander',
  booking_type TEXT NOT NULL CHECK (booking_type IN ('property_viewing', 'sda_consultation', 'investor_inspection', 'coordinator_meeting', 'pathway_review')),
  participant_id UUID REFERENCES participants(id),
  investor_id UUID REFERENCES investors(id),
  property_id UUID REFERENCES properties(id),
  conversion_property_id UUID REFERENCES conversion_properties(id),
  social_media_lead_id UUID REFERENCES social_media_leads(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'Australia/Melbourne',
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  admin_user_id UUID,
  google_event_id TEXT,
  microsoft_event_id TEXT,
  gohighlevel_appointment_id TEXT,
  calendar_invite_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show')),
  confirmation_token TEXT UNIQUE,
  booking_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_property_matches_participant ON property_matches(participant_id);
CREATE INDEX idx_property_matches_property ON property_matches(property_id);
CREATE INDEX idx_property_matches_investor ON property_matches(investor_id);
CREATE INDEX idx_property_matches_status ON property_matches(status);
CREATE INDEX idx_property_matches_pathway ON property_matches(pathway_type);
CREATE INDEX idx_property_matches_score ON property_matches(ai_match_score DESC);

CREATE INDEX idx_conversion_properties_suburb ON conversion_properties(suburb);
CREATE INDEX idx_conversion_properties_type ON conversion_properties(property_type);
CREATE INDEX idx_conversion_properties_status ON conversion_properties(status);
CREATE INDEX idx_conversion_properties_score ON conversion_properties(overall_conversion_score DESC);
CREATE INDEX idx_conversion_properties_demand ON conversion_properties(confirmed_participant_demand DESC);

CREATE INDEX idx_investor_opportunities_investor ON investor_opportunities(investor_id);
CREATE INDEX idx_investor_opportunities_property ON investor_opportunities(property_id);
CREATE INDEX idx_investor_opportunities_status ON investor_opportunities(status);
CREATE INDEX idx_investor_opportunities_pathway ON investor_opportunities(pathway_type);

CREATE INDEX idx_automated_reports_participant ON automated_reports(participant_id);
CREATE INDEX idx_automated_reports_investor ON automated_reports(investor_id);
CREATE INDEX idx_automated_reports_type ON automated_reports(report_type);
CREATE INDEX idx_automated_reports_status ON automated_reports(status);

CREATE INDEX idx_social_media_leads_source ON social_media_leads(source_type);
CREATE INDEX idx_social_media_leads_processed ON social_media_leads(processed);

CREATE INDEX idx_calendar_bookings_participant ON calendar_bookings(participant_id);
CREATE INDEX idx_calendar_bookings_scheduled ON calendar_bookings(scheduled_at);
CREATE INDEX idx_calendar_bookings_status ON calendar_bookings(status);

-- Enable RLS
ALTER TABLE property_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "property_matches_select_policy" ON property_matches FOR SELECT USING (true);
CREATE POLICY "property_matches_insert_policy" ON property_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "property_matches_update_policy" ON property_matches FOR UPDATE USING (true);

CREATE POLICY "conversion_properties_select_policy" ON conversion_properties FOR SELECT USING (true);
CREATE POLICY "conversion_properties_insert_policy" ON conversion_properties FOR INSERT WITH CHECK (true);
CREATE POLICY "conversion_properties_update_policy" ON conversion_properties FOR UPDATE USING (true);

CREATE POLICY "investor_opportunities_select_policy" ON investor_opportunities FOR SELECT USING (true);
CREATE POLICY "investor_opportunities_insert_policy" ON investor_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "investor_opportunities_update_policy" ON investor_opportunities FOR UPDATE USING (true);

CREATE POLICY "automated_reports_select_policy" ON automated_reports FOR SELECT USING (true);
CREATE POLICY "automated_reports_insert_policy" ON automated_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "automated_reports_update_policy" ON automated_reports FOR UPDATE USING (true);

CREATE POLICY "social_media_leads_select_policy" ON social_media_leads FOR SELECT USING (true);
CREATE POLICY "social_media_leads_insert_policy" ON social_media_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "social_media_leads_update_policy" ON social_media_leads FOR UPDATE USING (true);

CREATE POLICY "calendar_bookings_select_policy" ON calendar_bookings FOR SELECT USING (true);
CREATE POLICY "calendar_bookings_insert_policy" ON calendar_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "calendar_bookings_update_policy" ON calendar_bookings FOR UPDATE USING (true);

-- Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_matches_updated_at BEFORE UPDATE ON property_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_properties_updated_at BEFORE UPDATE ON conversion_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_opportunities_updated_at BEFORE UPDATE ON investor_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automated_reports_updated_at BEFORE UPDATE ON automated_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_leads_updated_at BEFORE UPDATE ON social_media_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_bookings_updated_at BEFORE UPDATE ON calendar_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO conversion_properties (
  property_address, suburb, postcode, state, property_type,
  bedrooms, bathrooms, purchase_price, conversion_cost_estimate,
  conversion_breakdown, established_area_score, sda_suitability_score,
  overall_conversion_score, source_platform, status
) VALUES (
  '15/123 Collins Street', 'Melbourne', '3000', 'VIC', 'apartment',
  2, 1, 550000, 70000,
  '{"sda_compliance": 45000, "ndis_registration": 15000, "soft_costs": 10000}'::jsonb,
  10, 9, 95,
  'realestate_com_au', 'scanned'
);

SELECT 'Pathway matching system migration completed successfully!' AS status;
