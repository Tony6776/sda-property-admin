-- Fix RLS Policies for Landlords and Investors Tables
-- Allow SELECT access with anon key so extracted data is visible

-- ============================================================================
-- LANDLORDS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "landlords_select_policy" ON landlords;
DROP POLICY IF EXISTS "landlords_insert_policy" ON landlords;
DROP POLICY IF EXISTS "landlords_update_policy" ON landlords;

-- Enable RLS
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow anyone to view landlords (for dashboard visibility)
CREATE POLICY "landlords_select_policy" ON landlords
  FOR SELECT
  USING (true);

-- INSERT: Allow service role and authenticated users to insert
CREATE POLICY "landlords_insert_policy" ON landlords
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- UPDATE: Allow service role and authenticated users to update
CREATE POLICY "landlords_update_policy" ON landlords
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- DELETE: Only service role can delete
CREATE POLICY "landlords_delete_policy" ON landlords
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- INVESTORS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "investors_select_policy" ON investors;
DROP POLICY IF EXISTS "investors_insert_policy" ON investors;
DROP POLICY IF EXISTS "investors_update_policy" ON investors;

-- Enable RLS
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow anyone to view investors (for dashboard visibility)
CREATE POLICY "investors_select_policy" ON investors
  FOR SELECT
  USING (true);

-- INSERT: Allow service role and authenticated users to insert
CREATE POLICY "investors_insert_policy" ON investors
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- UPDATE: Allow service role and authenticated users to update
CREATE POLICY "investors_update_policy" ON investors
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- DELETE: Only service role can delete
CREATE POLICY "investors_delete_policy" ON investors
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('landlords', 'investors');

-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('landlords', 'investors')
ORDER BY tablename, policyname;
