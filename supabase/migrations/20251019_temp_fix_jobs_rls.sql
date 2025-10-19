-- ============================================================================
-- TEMPORARY FIX: Simplify jobs RLS policies for authenticated users
-- ============================================================================
-- This is a simpler alternative to creating admin_users table.
-- All authenticated users can manage jobs in the 'plcg' organization.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can view jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Admin users can insert jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Admin users can update jobs in their organization" ON jobs;

-- Create simpler policies for authenticated users
CREATE POLICY "Authenticated users can view all jobs"
  ON jobs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );

CREATE POLICY "Authenticated users can update jobs"
  ON jobs FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );

CREATE POLICY "Authenticated users can delete jobs"
  ON jobs FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );

COMMENT ON POLICY "Authenticated users can view all jobs" ON jobs
  IS 'Temporary policy - all authenticated users can view jobs';
COMMENT ON POLICY "Authenticated users can insert jobs" ON jobs
  IS 'Temporary policy - authenticated users can create jobs in plcg org';
