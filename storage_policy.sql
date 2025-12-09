-- Enable RLS on storage.objects if not already enabled (usually is by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Create the bucket if it doesn't exist (optional via SQL, usually done via Dashboard, but good for completeness)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fiscal-certs', 'fiscal-certs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow users to upload their own certificates
-- Path convention: certs/{user_id}/{filename}
CREATE POLICY "Users can upload own certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fiscal-certs' AND
  (storage.foldername(name))[1] = 'certs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Policy: Allow users to view/download their own certificates
CREATE POLICY "Users can view own certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fiscal-certs' AND
  (storage.foldername(name))[1] = 'certs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Policy: Allow users to update/overwrite their own certificates
CREATE POLICY "Users can update own certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fiscal-certs' AND
  (storage.foldername(name))[1] = 'certs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 5. Policy: Allow users to delete their own certificates
CREATE POLICY "Users can delete own certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fiscal-certs' AND
  (storage.foldername(name))[1] = 'certs' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
