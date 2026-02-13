-- ==============================================
-- Multi-User Database Setup for Colormxr Pro
-- ==============================================
--
-- This SQL script sets up user ownership and Row Level Security (RLS)
-- for the series_gallery table so that each user can only see and edit
-- their own series.
--
-- YOUR USER ID: ca73fcfe-0b62-497f-8305-7d3358af8b86
--
-- Run this in Supabase SQL Editor when ready to implement multi-user support
-- ==============================================

-- Step 1: Add user_id column to series_gallery
ALTER TABLE series_gallery ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Step 2: Assign all existing series to your user
UPDATE series_gallery SET user_id = 'ca73fcfe-0b62-497f-8305-7d3358af8b86';

-- Step 3: Make user_id required for future inserts
ALTER TABLE series_gallery ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Enable RLS on series_gallery
ALTER TABLE series_gallery ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for series_gallery

-- Policy for SELECT (viewing)
CREATE POLICY "Users can view their own series"
ON series_gallery
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT (creating)
CREATE POLICY "Users can create their own series"
ON series_gallery
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (editing)
CREATE POLICY "Users can update their own series"
ON series_gallery
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE
CREATE POLICY "Users can delete their own series"
ON series_gallery
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==============================================
-- NOTES:
-- ==============================================
-- After running this SQL, the following will happen:
-- 1. Series name editing will work correctly
-- 2. Each user will only see their own series
-- 3. New series will automatically be assigned to the user who creates them
--
-- The code has already been updated in SeriesGalleryAddModal.jsx to include
-- user_id when creating new series (lines 107-119)
--
-- For complete multi-user support, you may also want to add similar
-- RLS policies to:
-- - shapeset_gallery table
-- - palette_gallery table
-- ==============================================
