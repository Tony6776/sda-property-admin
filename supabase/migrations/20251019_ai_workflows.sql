-- AI-Assisted Admin Workflows Migration
-- Creates tables for landlords, investors, jobs, AI actions, and file processing

-- ============================================================================
-- LANDLORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS landlords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Landlord Details
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  abn text,

  -- Address
  address text,
  suburb text,
  state text,
  postcode text,

  -- Banking
  bank_name text,
  bsb text,
  account_number text,

  -- Compliance
  ndis_registered boolean DEFAULT false,
  registration_number text,
  registration_expiry date,
  insurance_expiry date,

  -- Metadata
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Add landlord_id to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS landlord_id uuid REFERENCES landlords(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_landlords_organization ON landlords(organization_id);
CREATE INDEX IF NOT EXISTS idx_landlords_email ON landlords(email);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);

-- ============================================================================
-- INVESTORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Investor Details
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  entity_name text, -- Company/trust name if applicable

  -- Investment Profile
  total_portfolio_value numeric(15,2),
  available_capital numeric(15,2),
  investment_capacity numeric(15,2), -- Max willing to invest

  -- Preferences
  preferred_property_types text[], -- ['house', 'apartment', 'townhouse']
  preferred_locations text[], -- ['Melbourne', 'Sydney', 'Brisbane']
  preferred_sda_categories text[], -- ['Fully Accessible', 'High Physical Support']
  risk_tolerance text CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  min_roi_target numeric(5,2), -- e.g., 6.5 for 6.5%

  -- Performance
  total_investments integer DEFAULT 0,
  average_roi numeric(5,2),

  -- Metadata
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_investors_organization ON investors(organization_id);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);

-- ============================================================================
-- PLCG JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job Details
  job_name text NOT NULL,
  job_type text CHECK (job_type IN ('development', 'renovation', 'acquisition', 'management')),
  description text,

  -- Property Info
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_address text,
  property_type text,
  number_of_units integer,

  -- Financial
  total_investment_required numeric(15,2),
  investment_secured numeric(15,2) DEFAULT 0,
  expected_roi numeric(5,2), -- Annual ROI percentage
  projected_revenue numeric(15,2),
  projected_expenses numeric(15,2),

  -- Timeline
  estimated_start_date date,
  estimated_completion_date date,
  actual_start_date date,
  actual_completion_date date,

  -- Status
  status text DEFAULT 'new' CHECK (status IN ('new', 'funding_pending', 'funded', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Investors (many-to-many handled separately)
  target_investors uuid[], -- Array of investor IDs
  committed_investors uuid[], -- Array of investor IDs who committed

  -- Documents
  brief_url text,
  contract_urls text[],

  -- AI Data
  ai_match_score integer, -- How well this job matches available investors
  ai_recommendations jsonb, -- AI suggestions for this job

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_property ON jobs(property_id);

-- ============================================================================
-- JOB INVESTORS (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,

  -- Investment Details
  committed_amount numeric(15,2),
  commitment_date date,
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'interested', 'committed', 'withdrawn', 'rejected')),

  -- Communication
  pitch_sent_at timestamp,
  pitch_viewed_at timestamp,
  response_received_at timestamp,

  -- Metadata
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(job_id, investor_id)
);

CREATE INDEX IF NOT EXISTS idx_job_investors_job ON job_investors(job_id);
CREATE INDEX IF NOT EXISTS idx_job_investors_investor ON job_investors(investor_id);

-- ============================================================================
-- AI ACTIONS LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agent Info
  agent_type text NOT NULL CHECK (agent_type IN (
    'document_processing',
    'lead_qualification',
    'property_matching',
    'job_matching',
    'status_transition',
    'file_categorization',
    'performance_analysis',
    'pricing_suggestion',
    'maintenance_scheduling'
  )),

  -- Trigger
  trigger_event text NOT NULL,
  trigger_entity_type text, -- 'property', 'participant', 'landlord', 'investor', 'job'
  trigger_entity_id uuid,

  -- Input/Output
  input_data jsonb,
  output_data jsonb,
  extracted_data jsonb, -- Data extracted from documents

  -- Confidence
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Action Suggestion
  suggested_action text,
  suggested_action_data jsonb,

  -- Admin Review
  admin_reviewed boolean DEFAULT false,
  admin_approved boolean,
  admin_user_id uuid REFERENCES auth.users(id),
  admin_notes text,
  reviewed_at timestamp,

  -- Execution
  auto_executed boolean DEFAULT false,
  executed_at timestamp,
  execution_result jsonb,

  -- Metadata
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_actions_agent_type ON ai_actions(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_actions_entity ON ai_actions(trigger_entity_type, trigger_entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_reviewed ON ai_actions(admin_reviewed);
CREATE INDEX IF NOT EXISTS idx_ai_actions_created ON ai_actions(created_at DESC);

-- ============================================================================
-- AI RECOMMENDATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity
  entity_type text NOT NULL CHECK (entity_type IN ('property', 'participant', 'landlord', 'investor', 'job')),
  entity_id uuid NOT NULL,

  -- Recommendation
  recommendation_type text NOT NULL CHECK (recommendation_type IN (
    'price_adjustment',
    'send_matches',
    'schedule_viewing',
    'request_documents',
    'contact_lead',
    'update_status',
    'assign_investor',
    'flag_underperforming',
    'maintenance_due',
    'compliance_expiring'
  )),
  recommendation_title text NOT NULL,
  recommendation_description text,
  recommendation_data jsonb,

  -- Priority
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Action
  action_button_text text, -- e.g., "Send Email", "Update Price"
  action_endpoint text, -- API endpoint to call
  action_payload jsonb, -- Data to send with action

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_at timestamp,
  rejected_at timestamp,
  admin_user_id uuid REFERENCES auth.users(id),
  admin_notes text,

  -- Expiry
  expires_at timestamp,

  -- Metadata
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_entity ON ai_recommendations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created ON ai_recommendations(created_at DESC);

-- ============================================================================
-- FILE UPLOADS (Track all uploaded files)
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File Info
  original_filename text NOT NULL,
  stored_filename text NOT NULL,
  file_size bigint,
  mime_type text,
  storage_path text NOT NULL, -- Path in Supabase Storage
  storage_bucket text NOT NULL DEFAULT 'documents',

  -- Categorization
  file_category text CHECK (file_category IN (
    'lease_agreement',
    'compliance_certificate',
    'title_deed',
    'ndis_plan',
    'participant_id',
    'income_proof',
    'investment_brief',
    'contract',
    'property_photo',
    'floor_plan',
    'inspection_report',
    'other'
  )),

  -- Entity Association
  entity_type text CHECK (entity_type IN ('property', 'participant', 'landlord', 'investor', 'job')),
  entity_id uuid,

  -- AI Processing
  ai_processed boolean DEFAULT false,
  ai_detected_type text, -- What AI thinks the document type is
  ai_confidence integer CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_processing_error text,
  processed_at timestamp,

  -- OCR Data
  ocr_text text, -- Full extracted text
  ocr_completed boolean DEFAULT false,

  -- Admin Review
  admin_approved boolean,
  admin_rejected boolean,
  admin_user_id uuid REFERENCES auth.users(id),
  admin_notes text,
  reviewed_at timestamp,

  -- Metadata
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_category ON file_uploads(file_category);
CREATE INDEX IF NOT EXISTS idx_file_uploads_processed ON file_uploads(ai_processed);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created ON file_uploads(created_at DESC);

-- ============================================================================
-- DOCUMENT EXTRACTIONS (Structured data extracted from documents)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id uuid NOT NULL REFERENCES file_uploads(id) ON DELETE CASCADE,

  -- Extraction Data
  document_type text NOT NULL,
  extracted_fields jsonb NOT NULL, -- Structured data extracted

  -- Confidence Scores (per field)
  field_confidence jsonb, -- { "ndis_number": 98, "funding_amount": 95, ... }

  -- Validation
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'needs_review')),
  validation_errors jsonb, -- Array of validation error messages

  -- Applied to Entity
  applied_to_entity boolean DEFAULT false,
  applied_to_entity_id uuid,
  applied_at timestamp,

  -- Metadata
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_extractions_file ON document_extractions(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_document_extractions_status ON document_extractions(validation_status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Landlords RLS
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view landlords in their organization"
  ON landlords FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert landlords in their organization"
  ON landlords FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update landlords in their organization"
  ON landlords FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Investors RLS
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view investors in their organization"
  ON investors FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert investors in their organization"
  ON investors FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update investors in their organization"
  ON investors FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Jobs RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view jobs in their organization"
  ON jobs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert jobs in their organization"
  ON jobs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update jobs in their organization"
  ON jobs FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- AI Actions RLS (Admin users can view all)
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all AI actions"
  ON ai_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update AI actions"
  ON ai_actions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- AI Recommendations RLS
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all AI recommendations"
  ON ai_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update AI recommendations"
  ON ai_recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- File Uploads RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all file uploads"
  ON file_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert file uploads"
  ON file_uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update file uploads"
  ON file_uploads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Document Extractions RLS
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all document extractions"
  ON document_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_landlords_updated_at BEFORE UPDATE ON landlords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_investors_updated_at BEFORE UPDATE ON job_investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Sample Landlords
INSERT INTO landlords (organization_id, full_name, email, phone, business_name, ndis_registered, status)
VALUES
  ('homelander', 'John Smith', 'john.smith@landlord.com', '0412345678', 'Smith Property Group', true, 'active'),
  ('homelander', 'Sarah Johnson', 'sarah.j@properties.com', '0423456789', 'SJ Investments', true, 'active')
ON CONFLICT DO NOTHING;

-- Sample Investors
INSERT INTO investors (organization_id, full_name, email, phone, available_capital, investment_capacity, preferred_property_types, preferred_locations, risk_tolerance, min_roi_target, status)
VALUES
  ('homelander', 'Michael Brown', 'michael@investment.com', '0434567890', 1500000, 2000000, ARRAY['house', 'townhouse'], ARRAY['Melbourne', 'Sydney'], 'medium', 6.5, 'active'),
  ('homelander', 'Emma Davis', 'emma.d@capital.com', '0445678901', 800000, 1000000, ARRAY['apartment'], ARRAY['Brisbane'], 'low', 7.0, 'active')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE landlords IS 'Property landlords/owners managed by the platform';
COMMENT ON TABLE investors IS 'Investors for PLCG job opportunities';
COMMENT ON TABLE jobs IS 'PLCG jobs (developments, renovations, acquisitions)';
COMMENT ON TABLE ai_actions IS 'Log of all AI agent actions and suggestions';
COMMENT ON TABLE ai_recommendations IS 'Active AI recommendations for admin review';
COMMENT ON TABLE file_uploads IS 'Track all uploaded files with AI processing status';
COMMENT ON TABLE document_extractions IS 'Structured data extracted from documents via OCR/AI';
