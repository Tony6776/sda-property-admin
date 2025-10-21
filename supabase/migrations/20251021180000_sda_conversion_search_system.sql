-- =====================================================
-- SDA AI Property Conversion Search System
-- Migration: 20251021_sda_conversion_search_system.sql
-- =====================================================

-- =====================================================
-- 1. CONVERSION SEARCH REQUESTS TABLE
-- Stores search criteria for AI property searches
-- =====================================================
CREATE TABLE IF NOT EXISTS conversion_search_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Search Criteria (stored as JSONB for flexibility)
  search_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "region": "Melbourne VIC 3000",
  --   "suburbs": ["Melbourne", "Carlton", "Fitzroy"],
  --   "postcode": "3000",
  --   "state": "VIC",
  --   "sda_category": "High Physical Support",
  --   "sda_building_types": ["Apartment", "Villa"],
  --   "sda_funding_amount": 85000,
  --   "bedrooms": 2,
  --   "bathrooms": 2,
  --   "max_purchase_price": 750000,
  --   "additional_requirements": "Ground floor access required"
  -- }

  -- Source Tracking
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'jotform', 'webform', 'facebook')) DEFAULT 'manual',
  source_metadata JSONB DEFAULT '{}'::jsonb, -- Original form/post data

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,

  -- Admin tracking
  requested_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversion_search_requests
CREATE INDEX idx_conversion_search_requests_participant ON conversion_search_requests(participant_id);
CREATE INDEX idx_conversion_search_requests_organization ON conversion_search_requests(organization_id);
CREATE INDEX idx_conversion_search_requests_status ON conversion_search_requests(status);
CREATE INDEX idx_conversion_search_requests_source_type ON conversion_search_requests(source_type);
CREATE INDEX idx_conversion_search_requests_created_at ON conversion_search_requests(created_at DESC);
CREATE INDEX idx_conversion_search_requests_search_criteria ON conversion_search_requests USING gin(search_criteria);

-- =====================================================
-- 2. CONVERSION SEARCH RESULTS TABLE
-- Stores AI-matched properties with scores and reasoning
-- =====================================================
CREATE TABLE IF NOT EXISTS conversion_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id UUID REFERENCES conversion_search_requests(id) ON DELETE CASCADE NOT NULL,

  -- Property Source
  property_source TEXT NOT NULL CHECK (property_source IN ('internal_db', 'internal_conversion', 'domain_com_au', 'realestate_com_au', 'scraped')),
  property_source_id TEXT, -- ID from external source
  property_listing_url TEXT,

  -- Property Data (full details stored as JSONB)
  property_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "address": "123 Main St, Melbourne VIC 3000",
  --   "suburb": "Melbourne",
  --   "state": "VIC",
  --   "postcode": "3000",
  --   "price": 750000,
  --   "bedrooms": 3,
  --   "bathrooms": 2,
  --   "land_size_sqm": 600,
  --   "property_type": "house",
  --   "listing_url": "https://...",
  --   "images": ["url1", "url2"],
  --   "description": "..."
  -- }

  -- AI Scoring and Reasoning
  suitability_score INTEGER CHECK (suitability_score >= 0 AND suitability_score <= 100),
  ai_reasoning JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "overall_score": 87,
  --   "category_match_explanation": "Perfect for High Physical Support...",
  --   "structural_suitability_score": 85,
  --   "structural_reasoning": "Wide hallways, ground floor access...",
  --   "location_accessibility_score": 90,
  --   "location_reasoning": "2km from hospital, 1.5km from transport...",
  --   "financial_viability_score": 85,
  --   "financial_reasoning": "ROI analysis...",
  --   "conversion_cost_estimate": 250000,
  --   "total_investment": 1000000,
  --   "roi_projection": "15% annual return based on SDA funding",
  --   "key_features": ["Ground floor", "Wide hallways", "Near transport"],
  --   "concerns": ["Minor structural modifications needed"],
  --   "sda_funding_coverage": 85
  -- }

  -- Ranking
  rank INTEGER, -- 1 = best match, 2 = second best, etc.

  -- Website Integration
  approved_for_website BOOLEAN DEFAULT FALSE,
  added_to_properties BOOLEAN DEFAULT FALSE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- Duplicate Detection
  duplicate_check_status TEXT CHECK (duplicate_check_status IN ('not_checked', 'unique', 'duplicate')) DEFAULT 'not_checked',
  duplicate_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversion_search_results
CREATE INDEX idx_conversion_search_results_request ON conversion_search_results(search_request_id);
CREATE INDEX idx_conversion_search_results_score ON conversion_search_results(suitability_score DESC);
CREATE INDEX idx_conversion_search_results_rank ON conversion_search_results(search_request_id, rank);
CREATE INDEX idx_conversion_search_results_property ON conversion_search_results(property_id);
CREATE INDEX idx_conversion_search_results_property_data ON conversion_search_results USING gin(property_data);
CREATE INDEX idx_conversion_search_results_ai_reasoning ON conversion_search_results USING gin(ai_reasoning);

-- =====================================================
-- 3. SEARCH APPROVALS TABLE
-- Tracks approval workflow and website integration
-- =====================================================
CREATE TABLE IF NOT EXISTS search_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id UUID REFERENCES conversion_search_requests(id) ON DELETE CASCADE NOT NULL,
  search_result_id UUID REFERENCES conversion_search_results(id) ON DELETE CASCADE,

  -- Approval Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

  -- Admin Review
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,

  -- PDF Generation
  pdf_generated BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  -- Participant Communication
  sent_to_participant BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  email_sent_to TEXT,

  -- Website Integration
  add_to_website BOOLEAN DEFAULT FALSE,
  website_pathways TEXT[], -- ['sale', 'lease', 'rent-to-buy', 'equity-share']
  target_audience TEXT[], -- ['participants', 'investors']
  property_created_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_creation_metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search_approvals
CREATE INDEX idx_search_approvals_request ON search_approvals(search_request_id);
CREATE INDEX idx_search_approvals_result ON search_approvals(search_result_id);
CREATE INDEX idx_search_approvals_status ON search_approvals(status);
CREATE INDEX idx_search_approvals_reviewed_by ON search_approvals(reviewed_by);

-- =====================================================
-- 4. SEARCH TO PROPERTY MAPPINGS TABLE
-- Attribution tracking: which searches led to which properties
-- =====================================================
CREATE TABLE IF NOT EXISTS search_to_property_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id UUID REFERENCES conversion_search_requests(id) ON DELETE CASCADE NOT NULL,
  search_result_id UUID REFERENCES conversion_search_results(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,

  -- Pathway Configuration
  pathway_types TEXT[], -- which pathways offered for this property

  -- Admin Tracking
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

  -- Analytics Data
  lead_attribution JSONB DEFAULT '{}'::jsonb,
  -- Track conversion funnel: search → result → property → lead → conversion

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search_to_property_mappings
CREATE INDEX idx_search_property_mappings_search ON search_to_property_mappings(search_request_id);
CREATE INDEX idx_search_property_mappings_result ON search_to_property_mappings(search_result_id);
CREATE INDEX idx_search_property_mappings_property ON search_to_property_mappings(property_id);
CREATE INDEX idx_search_property_mappings_created_at ON search_to_property_mappings(created_at DESC);

-- =====================================================
-- 5. UPDATE EXISTING TABLES
-- =====================================================

-- Add tracking column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_from_search_request_id UUID REFERENCES conversion_search_requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_properties_search_request ON properties(created_from_search_request_id);

-- Add is_conversion_opportunity flag if not exists
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_conversion_opportunity BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_properties_conversion_opportunity ON properties(is_conversion_opportunity);

-- Add SDA funding required field
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sda_funding_required NUMERIC(12,2);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE conversion_search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_to_property_mappings ENABLE ROW LEVEL SECURITY;

-- Policies for conversion_search_requests
CREATE POLICY "Users can view search requests in their organization"
  ON conversion_search_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create search requests in their organization"
  ON conversion_search_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update search requests in their organization"
  ON conversion_search_requests FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE id = auth.uid()
    )
  );

-- Policies for conversion_search_results
CREATE POLICY "Users can view search results for their org requests"
  ON conversion_search_results FOR SELECT
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can insert search results"
  ON conversion_search_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update search results in their organization"
  ON conversion_search_results FOR UPDATE
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

-- Policies for search_approvals
CREATE POLICY "Users can view approvals for their org requests"
  ON search_approvals FOR SELECT
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create approvals in their organization"
  ON search_approvals FOR INSERT
  WITH CHECK (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update approvals in their organization"
  ON search_approvals FOR UPDATE
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

-- Policies for search_to_property_mappings
CREATE POLICY "Users can view mappings for their organization"
  ON search_to_property_mappings FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create mappings in their organization"
  ON search_to_property_mappings FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversion_search_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER conversion_search_requests_updated_at
  BEFORE UPDATE ON conversion_search_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_conversion_search_updated_at();

CREATE TRIGGER conversion_search_results_updated_at
  BEFORE UPDATE ON conversion_search_results
  FOR EACH ROW
  EXECUTE FUNCTION update_conversion_search_updated_at();

CREATE TRIGGER search_approvals_updated_at
  BEFORE UPDATE ON search_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_conversion_search_updated_at();

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO conversion_search_requests (
  organization_id,
  search_criteria,
  source_type,
  status,
  created_at
) VALUES (
  (SELECT id FROM organizations LIMIT 1),
  '{
    "region": "Melbourne VIC 3000",
    "suburbs": ["Melbourne", "Carlton"],
    "postcode": "3000",
    "state": "VIC",
    "sda_category": "High Physical Support",
    "sda_building_types": ["Apartment", "Villa"],
    "sda_funding_amount": 85000,
    "bedrooms": 2,
    "bathrooms": 2,
    "max_purchase_price": 750000
  }'::jsonb,
  'manual',
  'completed',
  NOW()
);
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE conversion_search_requests IS 'AI property search requests with criteria and source tracking';
COMMENT ON TABLE conversion_search_results IS 'AI-scored property matches with detailed reasoning';
COMMENT ON TABLE search_approvals IS 'Approval workflow and website integration tracking';
COMMENT ON TABLE search_to_property_mappings IS 'Attribution: which searches created which properties';
