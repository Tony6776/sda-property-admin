-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to INSERT files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to SELECT files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to UPDATE files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to DELETE files" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;

-- Policy 1: Allow authenticated users to INSERT files
CREATE POLICY "Allow authenticated users to INSERT files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
);

-- Policy 2: Allow authenticated users to SELECT files
CREATE POLICY "Allow authenticated users to SELECT files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
);

-- Policy 3: Allow authenticated users to UPDATE files
CREATE POLICY "Allow authenticated users to UPDATE files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
)
WITH CHECK (
  bucket_id = 'documents'
);

-- Policy 4: Allow authenticated users to DELETE files
CREATE POLICY "Allow authenticated users to DELETE files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
);

-- Policy 5: Allow service role full access (for Edge Functions)
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (
  bucket_id = 'documents'
)
WITH CHECK (
  bucket_id = 'documents'
);

-- Add source and jotform tracking columns to file_uploads if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='file_uploads' AND column_name='source') THEN
    ALTER TABLE file_uploads ADD COLUMN source text
      CHECK (source IN ('manual', 'jotform', 'email', 'api')) DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='file_uploads' AND column_name='source_submission_id') THEN
    ALTER TABLE file_uploads ADD COLUMN source_submission_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='file_uploads' AND column_name='jotform_form_id') THEN
    ALTER TABLE file_uploads ADD COLUMN jotform_form_id text;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_file_uploads_source ON file_uploads(source);
CREATE INDEX IF NOT EXISTS idx_file_uploads_submission ON file_uploads(source_submission_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_jotform_form ON file_uploads(jotform_form_id);

-- Verify bucket exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    RAISE NOTICE '✅ Storage bucket "documents" configured successfully';
  ELSE
    RAISE NOTICE '⚠️ Storage bucket "documents" not found - check configuration';
  END IF;
END $$;
