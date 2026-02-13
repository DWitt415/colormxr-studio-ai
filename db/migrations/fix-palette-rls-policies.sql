-- Script to fix RLS policies for palette_gallery table
-- Run this in the Supabase SQL Editor

-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Anyone can insert palette gallery items" ON palette_gallery;
DROP POLICY IF EXISTS "Authenticated users can insert palette gallery items" ON palette_gallery;

-- Create correct INSERT policy with WITH CHECK clause
-- This allows anonymous users to insert records
CREATE POLICY "Anyone can insert palette gallery items" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (true);

-- Also verify the storage policies are set correctly
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public Write Access for Palette Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Write Access for Palette Gallery" ON storage.objects;

-- Recreate with correct permissions for anonymous uploads
CREATE POLICY "Public Write Access for Palette Gallery" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'palette-gallery');

-- Verify the select policy exists
DROP POLICY IF EXISTS "Public Read Access for Palette Gallery" ON storage.objects;

-- Recreate the read policy
CREATE POLICY "Public Read Access for Palette Gallery" 
ON storage.objects 
FOR SELECT
USING (bucket_id = 'palette-gallery');
