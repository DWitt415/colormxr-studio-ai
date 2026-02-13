#!/usr/bin/env node

/**
 * Bulk PNG Upload Script for Supabase Storage
 *
 * Usage:
 *   node scripts/upload-pngs.js /path/to/desktop/folder
 *
 * This script will:
 * 1. Read all PNG files from the specified directory
 * 2. Upload them to Supabase storage bucket 'png-gallery'
 * 3. Create database records in 'png_gallery' table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with SERVICE ROLE key for admin access
// The service role key bypasses RLS policies and should NEVER be exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  console.error('');
  console.error('To get your service role key:');
  console.error('1. Go to Supabase Dashboard → Settings → API');
  console.error('2. Copy the "service_role" key (NOT the anon key)');
  console.error('3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'png-gallery';
const TABLE_NAME = 'png_gallery';

async function uploadPNGs(directoryPath) {
  // Verify directory exists
  if (!fs.existsSync(directoryPath)) {
    console.error(`❌ Directory not found: ${directoryPath}`);
    process.exit(1);
  }

  // Get all PNG files
  const files = fs.readdirSync(directoryPath)
    .filter(file => file.toLowerCase().endsWith('.png'))
    .sort();

  console.log(`📁 Found ${files.length} PNG files in ${directoryPath}`);

  if (files.length === 0) {
    console.error('❌ No PNG files found');
    process.exit(1);
  }

  console.log(`🚀 Starting upload to Supabase bucket: ${BUCKET_NAME}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(directoryPath, filename);

    try {
      // Read file
      const fileBuffer = fs.readFileSync(filePath);

      // Generate unique filename (keep original name but add timestamp if needed)
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;

      console.log(`[${i + 1}/${files.length}] Uploading ${filename}...`);

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFilename, fileBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`  ❌ Upload failed: ${uploadError.message}`);
        errorCount++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueFilename);

      // Insert record into database
      const { error: dbError } = await supabase
        .from(TABLE_NAME)
        .insert({
          filename: uniqueFilename,
          original_filename: filename,
          url: urlData.publicUrl,
          display_order: i,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error(`  ⚠️  File uploaded but database insert failed: ${dbError.message}`);
        // Don't increment error count - file is uploaded
      }

      console.log(`  ✅ Success`);
      successCount++;

    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));
}

// Get directory from command line argument
const directory = process.argv[2];

if (!directory) {
  console.error('❌ Usage: node scripts/upload-pngs.js /path/to/desktop/folder');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/upload-pngs.js ~/Desktop/my-images');
  process.exit(1);
}

// Run the upload
uploadPNGs(path.resolve(directory));
