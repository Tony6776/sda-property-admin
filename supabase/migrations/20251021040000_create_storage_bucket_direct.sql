-- Create storage bucket directly via SQL
DO $$
BEGIN
  -- Check if bucket exists
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'match-reports') THEN
    -- Create bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
    VALUES (
      'match-reports',
      'match-reports',
      false,
      10485760,
      ARRAY['application/pdf']::text[],
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created match-reports bucket';
  ELSE
    RAISE NOTICE 'Bucket match-reports already exists';
  END IF;
END $$;

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id = 'match-reports';
