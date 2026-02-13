-- Complete RLS Policy Fixes
-- This script will set up all necessary RLS policies for your Supabase project

-- 1. First, make sure RLS is enabled on both tables
ALTER TABLE palette_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE shapeset_gallery ENABLE ROW LEVEL SECURITY;

-- 2. Set up public view policies for both tables
-- These allow anyone to SELECT (view) items in the tables
DROP POLICY IF EXISTS "Anyone can view palette gallery items" ON palette_gallery;
DROP POLICY IF EXISTS "Anyone can view shapeset gallery items" ON shapeset_gallery;

CREATE POLICY "Anyone can view palette gallery items" 
ON palette_gallery 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view shapeset gallery items" 
ON shapeset_gallery 
FOR SELECT 
USING (true);

-- 3. Set up insert policies (allow anyone to insert)
-- These are more permissive than requiring authentication
DROP POLICY IF EXISTS "Anyone can insert palette gallery items" ON palette_gallery;
DROP POLICY IF EXISTS "Anyone can insert shapeset gallery items" ON shapeset_gallery;

CREATE POLICY "Anyone can insert palette gallery items" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can insert shapeset gallery items" 
ON shapeset_gallery 
FOR INSERT 
WITH CHECK (true);

-- 4. Set up storage bucket policies for palette-gallery
DROP POLICY IF EXISTS "Public Read Access for Palette Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Write Access for Palette Gallery" ON storage.objects;

CREATE POLICY "Public Read Access for Palette Gallery" 
ON storage.objects FOR SELECT
USING (bucket_id = 'palette-gallery');

CREATE POLICY "Public Write Access for Palette Gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'palette-gallery');

-- 5. Set up storage bucket policies for gallery bucket
DROP POLICY IF EXISTS "Public Read Access for Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Write Access for Gallery" ON storage.objects;

CREATE POLICY "Public Read Access for Gallery" 
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Public Write Access for Gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery');
