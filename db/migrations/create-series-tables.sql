-- Series gallery database schema updates
-- This script adds tables and relationships for the series feature

-- 1. Create series table to store series information
CREATE TABLE IF NOT EXISTS series_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_id UUID,  -- Reference to a composition that will be used as the thumbnail
  type TEXT NOT NULL, -- Type can be 'composition' or 'palette'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add index for better performance 
CREATE INDEX IF NOT EXISTS series_gallery_created_at_idx ON series_gallery(created_at DESC);

-- 3. Enable RLS for the series table
ALTER TABLE series_gallery ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow anyone to view series
CREATE POLICY "Anyone can view series gallery items" 
ON series_gallery 
FOR SELECT 
USING (true);

-- 5. Create policy for inserting new series (authenticated users only)
CREATE POLICY "Authenticated users can insert series gallery items" 
ON series_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 6. Add series_id columns to existing gallery tables
ALTER TABLE shapeset_gallery ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES series_gallery(id);
ALTER TABLE palette_gallery ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES series_gallery(id);

-- 7. Add index for faster series-based lookups
CREATE INDEX IF NOT EXISTS shapeset_gallery_series_idx ON shapeset_gallery(series_id);
CREATE INDEX IF NOT EXISTS palette_gallery_series_idx ON palette_gallery(series_id);

-- 8. Create function to update thumbnail for series when new item is added 
-- This automatically sets the first item as the thumbnail if none exists
CREATE OR REPLACE FUNCTION update_series_thumbnail() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the series exists and has no thumbnail
  IF (SELECT thumbnail_id FROM series_gallery WHERE id = NEW.series_id) IS NULL THEN
    -- Update the series to use this new item as the thumbnail
    UPDATE series_gallery 
    SET thumbnail_id = NEW.id
    WHERE id = NEW.series_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers to call the function when items are added to galleries
DROP TRIGGER IF EXISTS update_shapeset_series_thumbnail ON shapeset_gallery;
CREATE TRIGGER update_shapeset_series_thumbnail
AFTER INSERT ON shapeset_gallery
FOR EACH ROW
WHEN (NEW.series_id IS NOT NULL)
EXECUTE FUNCTION update_series_thumbnail();

DROP TRIGGER IF EXISTS update_palette_series_thumbnail ON palette_gallery;
CREATE TRIGGER update_palette_series_thumbnail
AFTER INSERT ON palette_gallery
FOR EACH ROW
WHEN (NEW.series_id IS NOT NULL)
EXECUTE FUNCTION update_series_thumbnail();
