-- Migration: Create NDIA Payment Batches Table
-- Purpose: NDIA payment batch submissions and reconciliation
-- Date: 2025-10-27
-- Source: Extracted from _archive/20251020_property_management.sql
-- Dependencies: Requires rental_payments table (created in 20251027_create_tenancies_table.sql)

-- ============================================================================
-- NDIA PAYMENT BATCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ndia_payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Batch Details
  batch_number TEXT UNIQUE NOT NULL,
  batch_date DATE NOT NULL,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,

  -- Submission
  submission_date DATE,
  submission_method TEXT CHECK (submission_method IN ('portal', 'csv_upload', 'api', 'manual')),
  submitted_by UUID REFERENCES auth.users(id),

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'processing', 'approved', 'rejected', 'paid', 'cancelled')),

  -- Amounts
  total_properties INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  approved_amount NUMERIC(12,2),

  -- NDIA Response
  ndia_reference TEXT,
  ndia_approval_date DATE,
  ndia_payment_date DATE,
  ndia_rejection_reason TEXT,

  -- CSV Export
  csv_file_url TEXT,
  csv_generated_at TIMESTAMPTZ,
  csv_generated_by UUID REFERENCES auth.users(id),

  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciled_date DATE,
  reconciled_by UUID REFERENCES auth.users(id),
  reconciliation_notes TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for NDIA payment batches
CREATE INDEX IF NOT EXISTS idx_ndia_batches_organization ON ndia_payment_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_batch_number ON ndia_payment_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_status ON ndia_payment_batches(status);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_period ON ndia_payment_batches(payment_period_start, payment_period_end);
CREATE INDEX IF NOT EXISTS idx_ndia_batches_submission_date ON ndia_payment_batches(submission_date);

-- ============================================================================
-- LINK RENTAL PAYMENTS TO BATCHES
-- ============================================================================

-- Add foreign key constraint from rental_payments to ndia_payment_batches
-- Note: rental_payments.ndia_batch_id column already exists from tenancies migration
ALTER TABLE rental_payments
DROP CONSTRAINT IF EXISTS rental_payments_ndia_batch_id_fkey;

ALTER TABLE rental_payments
ADD CONSTRAINT rental_payments_ndia_batch_id_fkey
FOREIGN KEY (ndia_batch_id) REFERENCES ndia_payment_batches(id) ON DELETE SET NULL;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE ndia_payment_batches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "ndia_batches_service_role_access" ON ndia_payment_batches;
DROP POLICY IF EXISTS "ndia_batches_admin_org_access" ON ndia_payment_batches;
DROP POLICY IF EXISTS "Admin users can view NDIA batches in their organization" ON ndia_payment_batches;
DROP POLICY IF EXISTS "Admin users can insert NDIA batches in their organization" ON ndia_payment_batches;
DROP POLICY IF EXISTS "Admin users can update NDIA batches in their organization" ON ndia_payment_batches;

-- Service role full access
CREATE POLICY "ndia_batches_service_role_access" ON ndia_payment_batches
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Admin users organization access
CREATE POLICY "ndia_batches_admin_org_access" ON ndia_payment_batches
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

-- Function to generate batch number
DROP FUNCTION IF EXISTS generate_batch_number();

CREATE FUNCTION generate_batch_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  seq_num INTEGER;
  batch_num TEXT;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYYY-MM');

  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(batch_number FROM 'BATCH-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM ndia_payment_batches
  WHERE batch_number LIKE 'BATCH-' || year_month || '-%';

  batch_num := 'BATCH-' || year_month || '-' || LPAD(seq_num::text, 3, '0');

  RETURN batch_num;
END;
$$ LANGUAGE plpgsql;

-- Table comments
COMMENT ON TABLE ndia_payment_batches IS 'NDIA payment batch submissions and reconciliation';
COMMENT ON FUNCTION generate_batch_number() IS 'Generates unique NDIA batch numbers in format BATCH-YYYY-MM-NNN';

SELECT 'NDIA payment batches table created successfully' AS status;
