-- MATCH REPORTS STORAGE BUCKET
-- Stores PDF reports generated for property matches, investor matches, and conversion properties
-- Generated: 2025-10-21

-- ==================== STORAGE BUCKET ====================

-- Create bucket for match reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'match-reports',
  'match-reports',
  false, -- Private bucket, access via signed URLs
  10485760, -- 10MB max file size
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ==================== RLS POLICIES ====================

-- Allow authenticated users to upload PDFs (typically Edge Functions with service role)
CREATE POLICY "Service role can upload match reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'match-reports'
  AND auth.jwt()->>'role' = 'service_role'
);

-- Allow authenticated admins to read match reports
CREATE POLICY "Admins can read match reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'match-reports'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.is_active = true
  )
);

-- Allow service role to delete old reports (cleanup)
CREATE POLICY "Service role can delete match reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'match-reports'
  AND auth.jwt()->>'role' = 'service_role'
);
