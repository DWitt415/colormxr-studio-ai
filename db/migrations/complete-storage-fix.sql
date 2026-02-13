-- Comprehensive Supabase Storage RLS Fix
-- This script resets and configures all storage permissions to allow anonymous access

-- 1. Verify and update bucket settings
UPDATE storage.buckets 
SET public = TRUE 
WHERE name = 'palette-gallery' AND public = FALSE;

UPDATE storage.buckets 
SET public = TRUE 
WHERE name = 'gallery' AND public = FALSE;

-- 2. Drop ALL existing storage policies to start fresh
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects;';
  END LOOP;
END $$;

-- 3. Create simplified universal access policy with NO restrictions
-- This is the most permissive policy possible - good for debugging
CREATE POLICY "Universal Full Access" 
ON storage.objects 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Create bucket-specific policies for each bucket (palette-gallery)
CREATE POLICY "Allow Full Access to palette-gallery" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'palette-gallery')
WITH CHECK (bucket_id = 'palette-gallery');

-- 5. Create bucket-specific policies for each bucket (gallery)
CREATE POLICY "Allow Full Access to gallery" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

-- 6. Grant necessary permissions to both anonymous and authenticated users
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.buckets TO authenticated;

-- 7. Make sure RLS is enabled but with our permissive policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Verify system tables that may affect storage operations
-- This command returns the roles that have specific privileges
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'objects' AND table_schema = 'storage';
