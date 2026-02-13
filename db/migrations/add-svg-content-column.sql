-- Script to add svg_content column to shapeset_gallery table
-- Run this in the Supabase SQL Editor

-- Add svg_content column if it doesn't exist
DO $$ 
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shapeset_gallery' AND column_name = 'svg_content'
  ) THEN
    -- Add the column
    ALTER TABLE shapeset_gallery ADD COLUMN svg_content TEXT;
    RAISE NOTICE 'Added svg_content column to shapeset_gallery table';
  ELSE
    RAISE NOTICE 'svg_content column already exists in shapeset_gallery table';
  END IF;
END $$;
