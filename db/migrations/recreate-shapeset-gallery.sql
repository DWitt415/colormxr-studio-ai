-- Script to recreate the shapeset_gallery table and its policies

-- 1. Create a table for storing shapeset gallery items
CREATE TABLE IF NOT EXISTS shapeset_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  shape_colors JSONB NOT NULL,
  background_color TEXT NOT NULL,
  svg_content TEXT,  -- Added SVG content column
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS shapeset_gallery_created_at_idx ON shapeset_gallery(created_at DESC);

-- 3. Enable Row Level Security (RLS) for the table
ALTER TABLE shapeset_gallery ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow anyone to view gallery items
CREATE POLICY "Anyone can view shapeset gallery items" 
ON shapeset_gallery 
FOR SELECT 
USING (true);

-- 5. Create policy for inserting new gallery items (allowing anonymous access)
CREATE POLICY "Anyone can insert shapeset gallery items" 
ON shapeset_gallery 
FOR INSERT 
USING (true);

-- 6. Check if the storage bucket exists and create policies for it
-- Note: You'll need to manually create the bucket from the Supabase dashboard
-- Go to Storage in the dashboard, click "Create bucket", name it "shapeset-gallery", and set it as public

-- 7. Set up Storage bucket policies for public access
-- Policy for the 'shapeset-gallery' bucket (for shapesets)
-- Public read access
DO $$ 
BEGIN
  -- Create policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Public Read Access for Shapeset Gallery' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Read Access for Shapeset Gallery" 
    ON storage.objects FOR SELECT
    USING (bucket_id = 'shapeset-gallery');
  END IF;
END $$;

-- 8. Public write access (allowing anonymous uploads)
DO $$ 
BEGIN
  -- Create policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Public Write Access for Shapeset Gallery' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Write Access for Shapeset Gallery" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'shapeset-gallery');
  END IF;
END $$;
