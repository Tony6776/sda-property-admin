-- Migration: Create Tenancies and Related Tables
-- Purpose: Property tenancy management, rental payments, and maintenance tracking
-- Date: 2025-10-27
-- Source: Extracted from _archive/20251020_property_management.sql

-- ============================================================================
-- TENANCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE RESTRICT,

  -- Lease Details
  lease_start_date DATE NOT NULL,
  lease_end_date DATE,
  lease_term_months INTEGER,
  lease_type TEXT CHECK (lease_type IN ('fixed', 'periodic', 'permanent')) DEFAULT 'fixed',

  -- Rental Details
  weekly_rent NUMERIC(10,2) NOT NULL,
  bond_amount NUMERIC(10,2),
  bond_lodged_date DATE,
  bond_reference TEXT,

  -- SDA Payment Details
  sda_category TEXT,
  sda_rate_per_day NUMERIC(10,2),
  sda_funding_approved BOOLEAN DEFAULT false,
  sda_funding_start_date DATE,
  sda_funding_end_date DATE,

  -- NDIS Plan Details
  ndis_plan_number TEXT,
  plan_manager_name TEXT,
  plan_manager_email TEXT,
  plan_manager_phone TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'ending', 'ended', 'cancelled')),
  move_in_date DATE,
  move_out_date DATE,
  notice_given_date DATE,
  notice_period_days INTEGER DEFAULT 28,

  -- Documents
  lease_document_url TEXT,
  condition_report_url TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for tenancies
CREATE INDEX IF NOT EXISTS idx_tenancies_organization ON tenancies(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_property ON tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_participant ON tenancies(participant_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_landlord ON tenancies(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_status ON tenancies(status);
CREATE INDEX IF NOT EXISTS idx_tenancies_dates ON tenancies(lease_start_date, lease_end_date);

-- ============================================================================
-- RENTAL PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE RESTRICT,

  -- Payment Period
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Amounts
  rent_amount NUMERIC(10,2) NOT NULL,
  sda_payment_amount NUMERIC(10,2),
  total_amount NUMERIC(10,2) NOT NULL,

  -- Payment Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'overdue', 'cancelled', 'refunded')),
  paid_date DATE,
  payment_method TEXT CHECK (payment_method IN ('ndia_direct', 'plan_manager', 'participant', 'other')),
  payment_reference TEXT,

  -- NDIA Submission
  submitted_to_ndia BOOLEAN DEFAULT false,
  ndia_submission_date DATE,
  ndia_batch_id UUID, -- Will be linked after ndia_payment_batches is created
  ndia_approved BOOLEAN,
  ndia_approval_date DATE,
  ndia_payment_reference TEXT,

  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciled_date DATE,
  reconciled_by UUID REFERENCES auth.users(id),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for rental payments
CREATE INDEX IF NOT EXISTS idx_rental_payments_organization ON rental_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_tenancy ON rental_payments(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_participant ON rental_payments(participant_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_landlord ON rental_payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_status ON rental_payments(status);
CREATE INDEX IF NOT EXISTS idx_rental_payments_due_date ON rental_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_rental_payments_period ON rental_payments(payment_period_start, payment_period_end);

-- ============================================================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenancy_id UUID REFERENCES tenancies(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,

  -- Request Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'garden', 'pest', 'security', 'accessibility', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),

  -- Location
  location_in_property TEXT,

  -- Status & Assignment
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  assigned_to TEXT,
  assigned_contact TEXT,
  assigned_date TIMESTAMPTZ,

  -- Dates
  reported_date TIMESTAMPTZ DEFAULT now(),
  required_by_date DATE,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Costs
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  cost_approved BOOLEAN DEFAULT false,
  cost_approved_by UUID REFERENCES auth.users(id),
  paid_by TEXT CHECK (paid_by IN ('landlord', 'tenant', 'insurance', 'warranty', 'other')),

  -- Photos & Documents
  photos_urls TEXT[],
  quote_document_url TEXT,
  invoice_document_url TEXT,
  completion_certificate_url TEXT,

  -- Compliance
  requires_ndis_approval BOOLEAN DEFAULT false,
  ndis_approval_status TEXT CHECK (ndis_approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  ndis_approval_date DATE,

  -- Resolution
  resolution_notes TEXT,
  participant_satisfaction_rating INTEGER CHECK (participant_satisfaction_rating BETWEEN 1 AND 5),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for maintenance requests
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_organization ON maintenance_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenancy ON maintenance_requests(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_landlord ON maintenance_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);

-- ============================================================================
-- LANDLORD STATEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS landlord_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,

  -- Statement Period
  statement_type TEXT CHECK (statement_type IN ('monthly', 'quarterly', 'eofy', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  financial_year TEXT,

  -- Summary Amounts
  total_rental_income NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  total_maintenance NUMERIC(12,2) DEFAULT 0,
  management_fees NUMERIC(12,2) DEFAULT 0,
  net_income NUMERIC(12,2) DEFAULT 0,

  -- Properties Included
  property_count INTEGER DEFAULT 0,
  property_ids UUID[],

  -- Generation
  generated_date TIMESTAMPTZ DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id),

  -- Delivery
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'viewed', 'downloaded')),
  sent_date TIMESTAMPTZ,
  sent_to_email TEXT,
  pdf_url TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for landlord statements
CREATE INDEX IF NOT EXISTS idx_landlord_statements_organization ON landlord_statements(organization_id);
CREATE INDEX IF NOT EXISTS idx_landlord_statements_landlord ON landlord_statements(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_statements_period ON landlord_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_landlord_statements_type ON landlord_statements(statement_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Tenancies RLS
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tenancies_service_role_access" ON tenancies;
DROP POLICY IF EXISTS "tenancies_admin_org_access" ON tenancies;
DROP POLICY IF EXISTS "Admin users can view tenancies in their organization" ON tenancies;
DROP POLICY IF EXISTS "Admin users can insert tenancies in their organization" ON tenancies;
DROP POLICY IF EXISTS "Admin users can update tenancies in their organization" ON tenancies;

-- Service role full access
CREATE POLICY "tenancies_service_role_access" ON tenancies
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Admin users organization access
CREATE POLICY "tenancies_admin_org_access" ON tenancies
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
);

-- Rental Payments RLS
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "rental_payments_service_role_access" ON rental_payments;
DROP POLICY IF EXISTS "rental_payments_admin_org_access" ON rental_payments;
DROP POLICY IF EXISTS "Admin users can view rental payments in their organization" ON rental_payments;
DROP POLICY IF EXISTS "Admin users can insert rental payments in their organization" ON rental_payments;
DROP POLICY IF EXISTS "Admin users can update rental payments in their organization" ON rental_payments;

CREATE POLICY "rental_payments_service_role_access" ON rental_payments
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "rental_payments_admin_org_access" ON rental_payments
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
);

-- Maintenance Requests RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "maintenance_requests_service_role_access" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_admin_org_access" ON maintenance_requests;
DROP POLICY IF EXISTS "Admin users can view maintenance requests in their organization" ON maintenance_requests;
DROP POLICY IF EXISTS "Admin users can insert maintenance requests in their organization" ON maintenance_requests;
DROP POLICY IF EXISTS "Admin users can update maintenance requests in their organization" ON maintenance_requests;

CREATE POLICY "maintenance_requests_service_role_access" ON maintenance_requests
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "maintenance_requests_admin_org_access" ON maintenance_requests
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
);

-- Landlord Statements RLS
ALTER TABLE landlord_statements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "landlord_statements_service_role_access" ON landlord_statements;
DROP POLICY IF EXISTS "landlord_statements_admin_org_access" ON landlord_statements;
DROP POLICY IF EXISTS "Admin users can view landlord statements in their organization" ON landlord_statements;
DROP POLICY IF EXISTS "Admin users can insert landlord statements in their organization" ON landlord_statements;
DROP POLICY IF EXISTS "Admin users can update landlord statements in their organization" ON landlord_statements;

CREATE POLICY "landlord_statements_service_role_access" ON landlord_statements
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "landlord_statements_admin_org_access" ON landlord_statements
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate next rent due date
DROP FUNCTION IF EXISTS calculate_next_rent_due(UUID);

CREATE FUNCTION calculate_next_rent_due(p_tenancy_id UUID)
RETURNS DATE AS $$
DECLARE
  last_payment_end DATE;
  next_due DATE;
BEGIN
  -- Get the end date of the most recent payment
  SELECT payment_period_end
  INTO last_payment_end
  FROM rental_payments
  WHERE tenancy_id = p_tenancy_id
  ORDER BY payment_period_end DESC
  LIMIT 1;

  IF last_payment_end IS NULL THEN
    -- No payments yet, use lease start date
    SELECT lease_start_date INTO last_payment_end
    FROM tenancies
    WHERE id = p_tenancy_id;
  END IF;

  -- Next due is 7 days after period end (weekly rent)
  next_due := last_payment_end + INTERVAL '7 days';

  RETURN next_due;
END;
$$ LANGUAGE plpgsql;

-- Table comments
COMMENT ON TABLE tenancies IS 'Manages property tenancies linking properties to participants';
COMMENT ON TABLE rental_payments IS 'Tracks rental payments and NDIA submissions';
COMMENT ON TABLE maintenance_requests IS 'Property maintenance and repair tracking';
COMMENT ON TABLE landlord_statements IS 'Generated financial statements for landlords';

SELECT 'Tenancies and related tables created successfully' AS status;
