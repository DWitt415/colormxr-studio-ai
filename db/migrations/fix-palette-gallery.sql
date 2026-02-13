-- SQL script to fix the palette_gallery table and RLS policies

-- 1. First, check if the URL column exists, and if not, add it
DO $$ 
BEGIN
  -- Check if the URL column already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'palette_gallery' AND column_name = 'url'
  ) THEN
    -- Add the URL column if it doesn't exist
    ALTER TABLE palette_gallery ADD COLUMN url TEXT;
  END IF;
END $$;

-- 2. Update the RLS policy for palette_gallery table
-- Delete any existing insert policies first to avoid conflicts
DO $$ 
BEGIN
  -- Check if the policy exists
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'palette_gallery' AND policyname = 'Authenticated users can insert palette gallery items'
  ) THEN
    -- Drop the existing policy
    DROP POLICY "Authenticated users can insert palette gallery items" ON palette_gallery;
  END IF;
END $$;

-- Create the insert policy with the correct settings
CREATE POLICY "Authenticated users can insert palette gallery items" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Set up storage bucket for palette-gallery if it doesn't exist
-- Note: You need to create the bucket via the Supabase dashboard UI, but we'll
-- create the policies here

-- Delete any existing policies first to avoid conflicts
DO $$ 
BEGIN
  -- Check if the policy exists
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Public Read Access for Palette Gallery' AND schemaname = 'storage'
  ) THEN
    -- Drop the existing policy
    DROP POLICY "Public Read Access for Palette Gallery" ON storage.objects;
  END IF;
  
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Authenticated Write Access for Palette Gallery' AND schemaname = 'storage'
  ) THEN
    -- Drop the existing policy
    DROP POLICY "Authenticated Write Access for Palette Gallery" ON storage.objects;
  END IF;
END $$;

-- Create the storage bucket policies
-- Public read access
CREATE POLICY "Public Read Access for Palette Gallery" 
ON storage.objects FOR SELECT
USING (bucket_id = 'palette-gallery');
  
-- Authenticated-only write access
CREATE POLICY "Authenticated Write Access for Palette Gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'palette-gallery' AND auth.role() = 'authenticated');
