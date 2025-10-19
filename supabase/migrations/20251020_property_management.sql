-- Property Management & NDIA Payment Processing Migration
-- Creates comprehensive rental management, maintenance, and NDIA payment tracking

-- ============================================================================
-- TENANCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  landlord_id uuid NOT NULL REFERENCES landlords(id) ON DELETE RESTRICT,

  -- Lease Details
  lease_start_date date NOT NULL,
  lease_end_date date,
  lease_term_months integer,
  lease_type text CHECK (lease_type IN ('fixed', 'periodic', 'permanent')) DEFAULT 'fixed',

  -- Rental Details
  weekly_rent numeric(10,2) NOT NULL,
  bond_amount numeric(10,2),
  bond_lodged_date date,
  bond_reference text,

  -- SDA Payment Details
  sda_category text, -- 'Fully Accessible', 'High Physical Support', etc.
  sda_rate_per_day numeric(10,2),
  sda_funding_approved boolean DEFAULT false,
  sda_funding_start_date date,
  sda_funding_end_date date,

  -- NDIS Plan Details
  ndis_plan_number text,
  plan_manager_name text,
  plan_manager_email text,
  plan_manager_phone text,

  -- Status
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'ending', 'ended', 'cancelled')),
  move_in_date date,
  move_out_date date,
  notice_given_date date,
  notice_period_days integer DEFAULT 28,

  -- Documents
  lease_document_url text,
  condition_report_url text,

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_tenancies_property ON tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_participant ON tenancies(participant_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_landlord ON tenancies(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_status ON tenancies(status);
CREATE INDEX IF NOT EXISTS idx_tenancies_dates ON tenancies(lease_start_date, lease_end_date);

-- ============================================================================
-- RENTAL PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rental_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  landlord_id uuid NOT NULL REFERENCES landlords(id) ON DELETE RESTRICT,

  -- Payment Period
  payment_period_start date NOT NULL,
  payment_period_end date NOT NULL,
  due_date date NOT NULL,

  -- Amounts
  rent_amount numeric(10,2) NOT NULL,
  sda_payment_amount numeric(10,2),
  total_amount numeric(10,2) NOT NULL,

  -- Payment Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'overdue', 'cancelled', 'refunded')),
  paid_date date,
  payment_method text CHECK (payment_method IN ('ndia_direct', 'plan_manager', 'participant', 'other')),
  payment_reference text,

  -- NDIA Submission
  submitted_to_ndia boolean DEFAULT false,
  ndia_submission_date date,
  ndia_batch_id uuid, -- Links to ndia_payment_batches
  ndia_approved boolean,
  ndia_approval_date date,
  ndia_payment_reference text,

  -- Reconciliation
  reconciled boolean DEFAULT false,
  reconciled_date date,
  reconciled_by uuid REFERENCES auth.users(id),

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenancy_id uuid REFERENCES tenancies(id) ON DELETE SET NULL,
  participant_id uuid REFERENCES participants(id) ON DELETE SET NULL,
  landlord_id uuid NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,

  -- Request Details
  title text NOT NULL,
  description text NOT NULL,
  category text CHECK (category IN ('plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'garden', 'pest', 'security', 'accessibility', 'other')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),

  -- Location
  location_in_property text, -- e.g., 'Kitchen', 'Bathroom 1', 'Bedroom 2'

  -- Status & Assignment
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  assigned_to text, -- Contractor/maintenance company name
  assigned_contact text,
  assigned_date timestamp,

  -- Dates
  reported_date timestamp DEFAULT now(),
  required_by_date date,
  scheduled_date timestamp,
  completed_date timestamp,

  -- Costs
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  cost_approved boolean DEFAULT false,
  cost_approved_by uuid REFERENCES auth.users(id),
  paid_by text CHECK (paid_by IN ('landlord', 'tenant', 'insurance', 'warranty', 'other')),

  -- Photos & Documents
  photos_urls text[], -- Array of photo URLs
  quote_document_url text,
  invoice_document_url text,
  completion_certificate_url text,

  -- Compliance (for accessibility modifications)
  requires_ndis_approval boolean DEFAULT false,
  ndis_approval_status text CHECK (ndis_approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  ndis_approval_date date,

  -- Resolution
  resolution_notes text,
  participant_satisfaction_rating integer CHECK (participant_satisfaction_rating BETWEEN 1 AND 5),

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenancy ON maintenance_requests(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_landlord ON maintenance_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);

-- ============================================================================
-- NDIA PAYMENT BATCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ndia_payment_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Batch Details
  batch_number text UNIQUE NOT NULL, -- e.g., 'BATCH-2025-01-001'
  batch_date date NOT NULL,
  payment_period_start date NOT NULL,
  payment_period_end date NOT NULL,

  -- Submission
  submission_date date,
  submission_method text CHECK (submission_method IN ('portal', 'csv_upload', 'api', 'manual')),
  submitted_by uuid REFERENCES auth.users(id),

  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'processing', 'approved', 'rejected', 'paid', 'cancelled')),

  -- Amounts
  total_properties integer DEFAULT 0,
  total_participants integer DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  approved_amount numeric(12,2),

  -- NDIA Response
  ndia_reference text,
  ndia_approval_date date,
  ndia_payment_date date,
  ndia_rejection_reason text,

  -- CSV Export
  csv_file_url text,
  csv_generated_at timestamp,
  csv_generated_by uuid REFERENCES auth.users(id),

  -- Reconciliation
  reconciled boolean DEFAULT false,
  reconciled_date date,
  reconciled_by uuid REFERENCES auth.users(id),
  reconciliation_notes text,

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ndia_batches_batch_number ON ndia_payment_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_status ON ndia_payment_batches(status);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_period ON ndia_payment_batches(payment_period_start, payment_period_end);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_submission_date ON ndia_payment_batches(submission_date);

-- Link rental_payments to batches (add foreign key)
ALTER TABLE rental_payments
DROP CONSTRAINT IF EXISTS rental_payments_ndia_batch_id_fkey;

ALTER TABLE rental_payments
ADD CONSTRAINT rental_payments_ndia_batch_id_fkey
FOREIGN KEY (ndia_batch_id) REFERENCES ndia_payment_batches(id) ON DELETE SET NULL;

-- ============================================================================
-- LANDLORD STATEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS landlord_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Relationships
  landlord_id uuid NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,

  -- Statement Period
  statement_type text CHECK (statement_type IN ('monthly', 'quarterly', 'eofy', 'custom')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  financial_year text, -- e.g., '2024-2025'

  -- Summary Amounts
  total_rental_income numeric(12,2) DEFAULT 0,
  total_expenses numeric(12,2) DEFAULT 0,
  total_maintenance numeric(12,2) DEFAULT 0,
  management_fees numeric(12,2) DEFAULT 0,
  net_income numeric(12,2) DEFAULT 0,

  -- Properties Included
  property_count integer DEFAULT 0,
  property_ids uuid[], -- Array of property IDs included

  -- Generation
  generated_date timestamp DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),

  -- Delivery
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'viewed', 'downloaded')),
  sent_date timestamp,
  sent_to_email text,
  pdf_url text,

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landlord_statements_landlord ON landlord_statements(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_statements_period ON landlord_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_landlord_statements_type ON landlord_statements(statement_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Tenancies RLS
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view tenancies in their organization"
  ON tenancies FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert tenancies in their organization"
  ON tenancies FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update tenancies in their organization"
  ON tenancies FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Rental Payments RLS
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view rental payments in their organization"
  ON rental_payments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert rental payments in their organization"
  ON rental_payments FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update rental payments in their organization"
  ON rental_payments FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Maintenance Requests RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view maintenance requests in their organization"
  ON maintenance_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert maintenance requests in their organization"
  ON maintenance_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update maintenance requests in their organization"
  ON maintenance_requests FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- NDIA Payment Batches RLS
ALTER TABLE ndia_payment_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view NDIA batches in their organization"
  ON ndia_payment_batches FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert NDIA batches in their organization"
  ON ndia_payment_batches FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update NDIA batches in their organization"
  ON ndia_payment_batches FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Landlord Statements RLS
ALTER TABLE landlord_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view landlord statements in their organization"
  ON landlord_statements FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert landlord statements in their organization"
  ON landlord_statements FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update landlord statements in their organization"
  ON landlord_statements FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate batch number
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS text AS $$
DECLARE
  year_month text;
  seq_num integer;
  batch_num text;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYYY-MM');

  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(batch_number FROM 'BATCH-[0-9]{4}-[0-9]{2}-([0-9]+)') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM ndia_payment_batches
  WHERE batch_number LIKE 'BATCH-' || year_month || '-%';

  batch_num := 'BATCH-' || year_month || '-' || LPAD(seq_num::text, 3, '0');

  RETURN batch_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next rent due date
CREATE OR REPLACE FUNCTION calculate_next_rent_due(tenancy_id uuid)
RETURNS date AS $$
DECLARE
  last_payment_end date;
  next_due date;
BEGIN
  -- Get the end date of the most recent payment
  SELECT payment_period_end
  INTO last_payment_end
  FROM rental_payments
  WHERE tenancy_id = $1
  ORDER BY payment_period_end DESC
  LIMIT 1;

  IF last_payment_end IS NULL THEN
    -- No payments yet, use lease start date
    SELECT lease_start_date INTO last_payment_end
    FROM tenancies
    WHERE id = $1;
  END IF;

  -- Next due is 7 days after period end (weekly rent)
  next_due := last_payment_end + INTERVAL '7 days';

  RETURN next_due;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Note: Sample data would go here if needed for testing
-- Skipping for production deployment

COMMENT ON TABLE tenancies IS 'Manages property tenancies linking properties to participants';
COMMENT ON TABLE rental_payments IS 'Tracks rental payments and NDIA submissions';
COMMENT ON TABLE maintenance_requests IS 'Property maintenance and repair tracking';
COMMENT ON TABLE ndia_payment_batches IS 'NDIA payment batch submissions';
COMMENT ON TABLE landlord_statements IS 'Generated financial statements for landlords';
