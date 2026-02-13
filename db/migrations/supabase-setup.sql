-- Supabase SQL Setup Script

-- Create the gallery storage bucket
-- Run this in Supabase SQL Editor

-- IMPORTANT NOTE:
-- Database tables CAN use underscores in their names (e.g., palette_gallery)
-- However, storage buckets CANNOT use underscores and must use hyphens instead (e.g., palette-gallery)
-- Keep this in mind when referring to these resources in your code

-- 1. Create a table for storing shapeset gallery items
CREATE TABLE IF NOT EXISTS shapeset_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  shape_colors JSONB NOT NULL,
  background_color TEXT NOT NULL,
  rows INTEGER NOT NULL,
  cols INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  -- Removing user_id reference since we're not implementing auth at this stage
);

-- Note: For consistency, if you want to rename this table to use hyphens instead of underscores
-- you can run the following command:
-- ALTER TABLE shapeset_gallery RENAME TO "shapeset-gallery";
-- 
-- However, unlike storage buckets, database tables in PostgreSQL/Supabase CAN use 
-- underscores, so this renaming isn't strictly necessary.

-- 1b. Create a table for storing color palette gallery items
CREATE TABLE IF NOT EXISTS palette_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  palette_colors JSONB NOT NULL,
  background_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Note: For consistency, if you want to rename this table to use hyphens instead of underscores
-- you can run the following command:
-- ALTER TABLE palette_gallery RENAME TO "palette-gallery";
--
-- However, unlike storage buckets, database tables in PostgreSQL/Supabase CAN use
-- underscores, so this renaming isn't strictly necessary.

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS shapeset_gallery_created_at_idx ON shapeset_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS palette_gallery_created_at_idx ON palette_gallery(created_at DESC);

-- 3. Create RLS (Row Level Security) policies for the gallery tables
ALTER TABLE shapeset_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE palette_gallery ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow anyone to view gallery items
CREATE POLICY "Anyone can view shapeset gallery items" 
ON shapeset_gallery 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view palette gallery items" 
ON palette_gallery 
FOR SELECT 
USING (true);

-- 5. Create policy for inserting new gallery items (authenticated users only)
CREATE POLICY "Authenticated users can insert shapeset gallery items" 
ON shapeset_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert palette gallery items" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 6. Set up Storage buckets and permissions
-- Note: Execute this in the SQL editor, but you also need to create the buckets via the dashboard
BEGIN;
  -- These are SQL commands to help with storage bucket setup
  -- For the actual bucket creation, you'll need to use the Supabase dashboard:
  -- 1. Go to Storage in the dashboard
  -- 2. Click "Create bucket"
  -- 3. Enter "gallery" as the name for shapeset storage
  -- 4. Enter "palette-gallery" as the name for palette storage (note: hyphens, not underscores)
  -- 5. Choose "Public bucket" for both applications
  
  -- 7. Set up Storage bucket policies for public access
  -- After creating the buckets, run these SQL commands to set up the policies:
  
  -- Policies for the 'gallery' bucket (for shapesets)
  -- Public read access
  CREATE POLICY "Public Read Access for Gallery" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');
  
  -- Authenticated-only write access
  CREATE POLICY "Authenticated Write Access for Gallery" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
  
  -- Policies for the 'palette-gallery' bucket (for palettes) - note the hyphen
  -- Public read access
  CREATE POLICY "Public Read Access for Palette Gallery" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'palette-gallery');
  
  -- Authenticated-only write access
  CREATE POLICY "Authenticated Write Access for Palette Gallery" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'palette-gallery' AND auth.role() = 'authenticated');
END;
