-- ==============================================
-- Create PNG Gallery Table
-- ==============================================
-- Run this in Supabase SQL Editor before uploading PNGs

CREATE TABLE png_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_png_gallery_display_order ON png_gallery(display_order);
CREATE INDEX idx_png_gallery_created_at ON png_gallery(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE png_gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view PNG records
-- (The images themselves are public via the bucket, but the gallery page requires login)
CREATE POLICY "Authenticated users can view PNG gallery"
ON png_gallery
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can insert (for upload script)
CREATE POLICY "Service role can insert"
ON png_gallery
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON png_gallery
FOR DELETE
TO authenticated
USING (true);
