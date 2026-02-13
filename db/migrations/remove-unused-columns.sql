-- Script to remove unnecessary columns from palette_gallery
-- First, check if the columns exist
DO $$ 
BEGIN
  -- Check if the 'name' column exists and drop it if it does
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'palette_gallery' AND column_name = 'name'
  ) THEN
    ALTER TABLE palette_gallery DROP COLUMN name;
    RAISE NOTICE 'Dropped column "name" from palette_gallery';
  ELSE
    RAISE NOTICE 'Column "name" does not exist in palette_gallery';
  END IF;

  -- Check if the 'colors' column exists and drop it if it does
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'palette_gallery' AND column_name = 'colors'
  ) THEN
    ALTER TABLE palette_gallery DROP COLUMN colors;
    RAISE NOTICE 'Dropped column "colors" from palette_gallery';
  ELSE
    RAISE NOTICE 'Column "colors" does not exist in palette_gallery';
  END IF;
END $$;
