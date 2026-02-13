-- Script to fix RLS policies for shapeset_gallery table
-- Run this in the Supabase SQL Editor

-- First, drop the existing policy if it exists (it's not working properly)
DROP POLICY IF EXISTS "Anyone can insert shapeset gallery items" ON shapeset_gallery;

-- Create correct INSERT policy with WITH CHECK clause
-- This allows anonymous users to insert records
CREATE POLICY "Anyone can insert shapeset gallery items" 
ON shapeset_gallery 
FOR INSERT 
WITH CHECK (true);

-- Also verify the storage policies are set correctly
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public Write Access for Shapeset Gallery" ON storage.objects;

-- Recreate with correct permissions for anonymous uploads
CREATE POLICY "Public Write Access for Shapeset Gallery" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shapeset-gallery');

-- Verify the select policy exists
DROP POLICY IF EXISTS "Public Read Access for Shapeset Gallery" ON storage.objects;

-- Recreate the read policy
CREATE POLICY "Public Read Access for Shapeset Gallery" 
ON storage.objects 
FOR SELECT
USING (bucket_id = 'shapeset-gallery');
