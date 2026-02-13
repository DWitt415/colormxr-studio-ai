# Supabase Row Level Security (RLS) Setup Guide

This guide explains how to properly set up RLS policies for both database tables and storage buckets in your Supabase project to fix permission-related errors like "row violates row-level security policy".

## Database Table Policies

### For `palette_gallery` and `shapeset_gallery` tables:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "Table Editor" in the left sidebar
4. Find and select the `palette_gallery` table
5. Click on "Policies" tab
6. Click "Add Policy" button
7. Select "Create custom policy" (or "Create policy from template" → "Insert only")
8. Configure the policy:
   - Name: `Authenticated users can insert palette gallery items`
   - Target roles: Select only `authenticated` (uncheck `anon` if you require login)
   - For an INSERT policy in the query builder:
     - You'll only see the WITH CHECK clause
     - Enter: `auth.role() = 'authenticated'`
   - If you see both USING and WITH CHECK fields:
     - Using expression: Leave blank or enter `true`
     - Check expression: `auth.role() = 'authenticated'`
9. Click "Save policy"
10. Repeat steps 4-9 for the `shapeset_gallery` table

## Storage Bucket Policies

### For `palette-gallery` and `gallery` buckets:

1. Go to your Supabase dashboard
2. Select your project
3. Click on "Storage" in the left sidebar
4. Make sure both buckets exist:
   - `palette-gallery` (with hyphen, not underscore)
   - `gallery`
5. For each bucket, create two separate policies:
   - Click on the bucket name
   - Click "Policies" tab
   
   a) For Read Access (public):
   - Click "Add Policy" button
   - Select "Create custom policy"
   - Name: "Public Read Access"
   - Operation: SELECT
   - Target roles: authenticated, anon
   - Using expression: `bucket_id = 'bucket-name'` (replace bucket-name with actual bucket name)
   - Click "Save policy"
   
   b) For Write Access (authenticated only):
   - Click "Add Policy" button again
   - Select "Create custom policy"
   - Name: "Authenticated Write Access"
   - Operations: INSERT, UPDATE, DELETE
   - Target roles: authenticated (only)
   - Using expression: `bucket_id = 'bucket-name' AND auth.role() = 'authenticated'`
   - Click "Save policy"

## Understanding Authentication Options

### Authenticated-Only vs Anonymous Access

There are two main approaches you can choose for your application:

1. **Authenticated-Only Access** (Recommended for production apps)
   - Only logged-in users can save palettes/shapesets
   - Better security and ability to associate content with users
   - Requires implementing login/signup functionality
   - This guide now shows policies for this approach

2. **Anonymous Access** (Simpler for demos or development)
   - Anyone can save palettes/shapesets without logging in
   - Easier to implement initially but less secure
   - Can't track which user created which content
   - To use this approach, change `auth.role() = 'authenticated'` to `true` in policies

Choose the approach that best matches your application's requirements. If you're building a production app, authenticated-only is recommended. If you're just testing or building a demo, anonymous access might be simpler.

### Policy Template Options in Supabase Dashboard

When creating policies through the dashboard:

- **Public access template**: Allows both authenticated and anonymous users
- **Individual access template**: Restricts access to each user's own data
- **Custom policy**: Most flexible, allows you to define precise conditions

For storage buckets, if you need a mix of public read but authenticated write, you'll need to create two separate policies as shown in this guide.

## Verify Policies through SQL

You can verify and fix your policies directly through SQL by running these commands in the SQL Editor:

```sql
-- For database tables
-- View policies can remain public (both authenticated and anonymous users)
CREATE POLICY "Anyone can view palette gallery items" 
ON palette_gallery 
FOR SELECT 
USING (true);

-- Insert policies restricted to authenticated users only
CREATE POLICY "Authenticated users can insert palette gallery items" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- If you're using the Supabase SQL editor and having trouble with the syntax:
-- For INSERT policies, you only need the WITH CHECK clause (not both)
CREATE POLICY "Simple authenticated insert" 
ON palette_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view shapeset gallery items" 
ON shapeset_gallery 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert shapeset gallery items" 
ON shapeset_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- For storage buckets
-- Read access can remain public (both authenticated and anonymous users)
CREATE POLICY "Public Read Access for Gallery" 
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Insert/Update/Delete access restricted to authenticated users
CREATE POLICY "Authenticated Write Access for Gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Similar policies for palette-gallery
CREATE POLICY "Public Read Access for Palette Gallery" 
ON storage.objects FOR SELECT
USING (bucket_id = 'palette-gallery');

CREATE POLICY "Authenticated Write Access for Palette Gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'palette-gallery' AND auth.role() = 'authenticated');
```

## SQL Query Builder Syntax

When creating RLS policies using Supabase's SQL editor, the syntax follows specific patterns depending on the operation:

### Understanding USING vs WITH CHECK

- **USING clause**: Used for SELECT, UPDATE, and DELETE operations
  - Controls which rows are visible or can be modified
  - Example: `USING (auth.role() = 'authenticated')`

- **WITH CHECK clause**: Used for INSERT and UPDATE operations
  - Controls which values can be inserted or updated
  - Example: `WITH CHECK (auth.role() = 'authenticated')`

### Operation-Specific Syntax

1. **For SELECT policies** (read access):
   ```sql
   CREATE POLICY "policy_name" ON table_name 
   FOR SELECT 
   USING (condition);
   ```
   Example: `USING (true)` to allow anyone to read

2. **For INSERT policies** (write access):
   ```sql
   CREATE POLICY "policy_name" ON table_name 
   FOR INSERT 
   WITH CHECK (condition);
   ```
   Example: `WITH CHECK (auth.role() = 'authenticated')` to allow only logged-in users

3. **For UPDATE policies** (modify access):
   ```sql
   CREATE POLICY "policy_name" ON table_name 
   FOR UPDATE 
   USING (condition)
   WITH CHECK (condition);
   ```
   Usually both conditions are the same: `USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')`

4. **For DELETE policies** (delete access):
   ```sql
   CREATE POLICY "policy_name" ON table_name 
   FOR DELETE 
   USING (condition);
   ```
   Example: `USING (auth.role() = 'authenticated')` to allow only logged-in users

5. **For ALL operations**:
   ```sql
   CREATE POLICY "policy_name" ON table_name 
   FOR ALL
   USING (condition);
   ```
   This applies the same condition to all operations (except INSERT which needs WITH CHECK)

### Practical Examples

**For Your Palette Gallery Table**:

```sql
-- Public read access
CREATE POLICY "public_read" ON palette_gallery 
FOR SELECT 
USING (true);

-- Authenticated-only insert
CREATE POLICY "auth_insert" ON palette_gallery 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
```

**For Storage**:

```sql
-- Public read access for palette-gallery bucket
CREATE POLICY "public_read" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'palette-gallery');

-- Authenticated-only upload to palette-gallery bucket
CREATE POLICY "auth_insert" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'palette-gallery' AND auth.role() = 'authenticated');
```

## Debugging RLS Issues

If you're still facing RLS issues:

1. **Authentication Check**: Verify you're actually authenticated in your app
   - Check that your login functionality correctly sets the auth token
   - You can add `console.log(await supabase.auth.getSession())` to confirm

2. **JWT Token**: Make sure your JWT token hasn't expired
   - Default session timeouts are 1 hour - your user might need to login again
   - You can extend this in Supabase Auth settings if needed

3. **RLS Bypass**: Try enabling "Bypass RLS" temporarily for your service role (in Project Settings → API)
   - This can help determine if the issue is truly RLS-related

4. **Supabase Logs**: Check the logs in your Supabase dashboard for detailed error messages

5. **Bucket Configuration**: Verify your storage buckets have the correct configuration

Remember that changes to RLS policies take effect immediately, but you might need to refresh your application or clear browser cache to see the effects.
