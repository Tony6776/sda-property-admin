-- Migration: Add Multi-Tenancy Support
-- Purpose: Support 3 businesses (Homelander, PLCG, Channel Agent) with audience segmentation
-- Date: 2025-10-18

-- ============================================
-- STEP 1: Create Organizations Table
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- 'property_provider', 'capital_firm', 'channel_agent'
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the 3 businesses
INSERT INTO organizations (id, name, business_type) VALUES
  ('homelander', 'Homelander SDA Solutions', 'property_provider'),
  ('plcg', 'Private Lending & Capital Group', 'capital_firm'),
  ('channel_agent', 'Channel Agent Real Estate', 'channel_agent')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Add Multi-Tenancy Columns to Properties
-- ============================================

-- Add organization_id (which business manages this property)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS organization_id TEXT DEFAULT 'homelander' REFERENCES organizations(id);

-- Add audience (who this property targets)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS audience TEXT; -- 'participant', 'investor', 'landlord', 'mixed'

-- Add visibility flags
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS visible_on_participant_site BOOLEAN DEFAULT true;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS visible_on_investor_site BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_properties_organization ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_audience ON properties(audience);

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for available properties
CREATE POLICY "public_read_available" ON properties
FOR SELECT
TO anon
USING (status = 'available' AND (
  (visible_on_participant_site = true) OR
  (visible_on_investor_site = true)
));

-- Policy: Authenticated users see properties from their organization
CREATE POLICY "organization_isolation" ON properties
FOR ALL
TO authenticated
USING (
  organization_id = current_setting('app.organization_id', true)
  OR current_setting('app.organization_id', true) IS NULL
);

-- Policy: Service role has full access (for admin operations)
CREATE POLICY "service_role_all_access" ON properties
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 4: Create Admin Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'manager', 'viewer'
  full_name TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own admin records
CREATE POLICY "users_see_own_admin_records" ON admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Service role full access
CREATE POLICY "service_role_admin_users_access" ON admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 5: Create Audit Log Table
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'sync'
  entity_type TEXT NOT NULL, -- 'property', 'admin_user', 'organization'
  entity_id TEXT NOT NULL,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================
-- STEP 6: Update Existing Data
-- ============================================

-- Set default audiences based on existing property types
UPDATE properties
SET audience = CASE
  WHEN property_type = 'participant_sda' THEN 'participant'
  WHEN property_type = 'lead_enquiry' THEN 'mixed'
  WHEN status IN ('participant_active', 'application review ') THEN 'participant'
  ELSE 'mixed'
END
WHERE audience IS NULL;

-- Set visibility flags based on audience
UPDATE properties
SET
  visible_on_participant_site = (audience IN ('participant', 'mixed')),
  visible_on_investor_site = (audience IN ('investor', 'mixed'))
WHERE visible_on_participant_site IS NULL OR visible_on_investor_site IS NULL;

-- ============================================
-- STEP 7: Create Helpful Views
-- ============================================

-- View: Properties for participant website (sdabyhomelander.com.au)
CREATE OR REPLACE VIEW participant_properties AS
SELECT
  p.id,
  p.name,
  p.address,
  p.property_type,
  p.status,
  p.bedrooms,
  p.bathrooms,
  p.price,
  p.weekly_rent,
  p.sda_category,
  p.accessibility,
  p.created_at,
  p.updated_at
FROM properties p
WHERE
  p.visible_on_participant_site = true
  AND p.status = 'available';

-- View: Properties for investor website (sdacapital.com.au)
CREATE OR REPLACE VIEW investor_properties AS
SELECT
  p.id,
  p.name,
  p.address,
  p.property_type,
  p.status,
  p.bedrooms,
  p.bathrooms,
  p.price,
  p.weekly_rent,
  p.sda_category,
  p.accessibility,
  p.created_at,
  p.updated_at,
  o.name as organization_name
FROM properties p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE
  p.visible_on_investor_site = true
  AND p.status = 'available';

-- ============================================
-- STEP 8: Create Functions for Common Operations
-- ============================================

-- Function: Set organization context for session
CREATE OR REPLACE FUNCTION set_organization_context(org_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.organization_id', org_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get properties for specific audience
CREATE OR REPLACE FUNCTION get_properties_for_audience(
  target_audience TEXT,
  include_mixed BOOLEAN DEFAULT true
)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE
    p.status = 'available'
    AND (
      p.audience = target_audience
      OR (include_mixed AND p.audience = 'mixed')
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Migration Complete
-- ============================================

-- Output summary
DO $$
DECLARE
  org_count INTEGER;
  property_count INTEGER;
  participant_count INTEGER;
  investor_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO property_count FROM properties;
  SELECT COUNT(*) INTO participant_count FROM properties WHERE visible_on_participant_site = true AND status = 'available';
  SELECT COUNT(*) INTO investor_count FROM properties WHERE visible_on_investor_site = true AND status = 'available';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Multi-Tenancy Migration Complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Organizations: %', org_count;
  RAISE NOTICE 'Total Properties: %', property_count;
  RAISE NOTICE 'Participant Site Properties: %', participant_count;
  RAISE NOTICE 'Investor Site Properties: %', investor_count;
  RAISE NOTICE '============================================';
END $$;
