-- ============================================================================
-- FIX: file_uploads RLS policies (IMMEDIATE FIX FOR DOCUMENT UPLOAD)
-- ============================================================================
-- Apply this first to fix document upload issue

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can view all file uploads" ON file_uploads;
DROP POLICY IF EXISTS "Admin users can insert file uploads" ON file_uploads;
DROP POLICY IF EXISTS "Admin users can update file uploads" ON file_uploads;

-- Create new simple policies
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

SELECT 'File uploads RLS fixed! Document upload should now work.' AS status;
