-- ============================================================================
-- FIX: Update ALL RLS policies to remove admin_users dependency
-- ============================================================================
-- Multiple tables have RLS policies referencing non-existent admin_users table
-- This migration fixes: landlords, investors, file_uploads, document_extractions,
-- ai_actions, ai_recommendations

-- ============================================================================
-- LANDLORDS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view landlords in their organization" ON landlords;
DROP POLICY IF EXISTS "Admin users can insert landlords in their organization" ON landlords;
DROP POLICY IF EXISTS "Admin users can update landlords in their organization" ON landlords;

CREATE POLICY "Authenticated users can view all landlords"
  ON landlords FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert landlords"
  ON landlords FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update landlords"
  ON landlords FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete landlords"
  ON landlords FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- INVESTORS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view investors in their organization" ON investors;
DROP POLICY IF EXISTS "Admin users can insert investors in their organization" ON investors;
DROP POLICY IF EXISTS "Admin users can update investors in their organization" ON investors;

CREATE POLICY "Authenticated users can view all investors"
  ON investors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert investors"
  ON investors FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update investors"
  ON investors FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete investors"
  ON investors FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- FILE UPLOADS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view all file uploads" ON file_uploads;
DROP POLICY IF EXISTS "Admin users can insert file uploads" ON file_uploads;
DROP POLICY IF EXISTS "Admin users can update file uploads" ON file_uploads;

CREATE POLICY "Authenticated users can view all file uploads"
  ON file_uploads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert file uploads"
  ON file_uploads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update file uploads"
  ON file_uploads FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete file uploads"
  ON file_uploads FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- DOCUMENT EXTRACTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view all document extractions" ON document_extractions;

CREATE POLICY "Authenticated users can view all document extractions"
  ON document_extractions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert document extractions"
  ON document_extractions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update document extractions"
  ON document_extractions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete document extractions"
  ON document_extractions FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- AI ACTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view all AI actions" ON ai_actions;
DROP POLICY IF EXISTS "Admin users can insert AI actions" ON ai_actions;

CREATE POLICY "Authenticated users can view all AI actions"
  ON ai_actions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert AI actions"
  ON ai_actions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update AI actions"
  ON ai_actions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete AI actions"
  ON ai_actions FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- AI RECOMMENDATIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admin users can view all AI recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Admin users can insert AI recommendations" ON ai_recommendations;

CREATE POLICY "Authenticated users can view all AI recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert AI recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update AI recommendations"
  ON ai_recommendations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete AI recommendations"
  ON ai_recommendations FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 'All RLS policies fixed! All authenticated users can now access tables.' AS status;
