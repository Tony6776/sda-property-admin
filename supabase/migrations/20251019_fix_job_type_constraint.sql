-- ============================================================================
-- FIX: Update job_type CHECK constraint to match form options
-- ============================================================================
-- The JobForm.tsx has different job_type values than the database allows
-- Form has: renovation, new_build, acquisition, development, sda_conversion
-- DB allowed: development, renovation, acquisition, management

-- Drop the existing constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;

-- Add new constraint with correct values
ALTER TABLE jobs ADD CONSTRAINT jobs_job_type_check
  CHECK (job_type IN (
    'renovation',
    'new_build',
    'acquisition',
    'development',
    'sda_conversion',
    'management'
  ));

COMMENT ON CONSTRAINT jobs_job_type_check ON jobs
  IS 'Allows: renovation, new_build, acquisition, development, sda_conversion, management';
