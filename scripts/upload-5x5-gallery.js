const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl ? 'loaded' : 'missing');
console.log('🔧 Supabase Key:', supabaseKey ? 'loaded' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImagesAndCreateGallery() {
    try {
        console.log('🚀 Starting 5x5 gallery upload...');

        // Use the existing series ID
        const seriesId = '67399901-ff54-476b-96cf-e0d4f198ad44';
        const series = { id: seriesId, name: '5x5' };

        console.log('📁 Using existing series:', series);

        // 2. Get all PNG files from public/5x5
        const imagesDir = path.join(__dirname, '../public/5x5');
        const files = fs.readdirSync(imagesDir)
            .filter(file => file.endsWith('.png'))
            .sort(); // Sort alphabetically

        console.log(`📸 Found ${files.length} images to upload`);

        // 3. Upload each image and create database entry
        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            const filepath = path.join(imagesDir, filename);

            console.log(`\n📤 [${i + 1}/${files.length}] Uploading ${filename}...`);

            // Read the file
            const fileBuffer = fs.readFileSync(filepath);

            // Upload to Supabase storage
            const storagePath = `5x5/${filename}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('shapeset-gallery')
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                console.error(`❌ Error uploading ${filename}:`, uploadError);
                continue;
            }

            console.log(`✅ Uploaded to storage: ${storagePath}`);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('shapeset-gallery')
                .getPublicUrl(storagePath);

            // Create database entry
            const { error: dbError } = await supabase
                .from('shapeset_gallery')
                .insert({
                    filename: filename,
                    shape_colors: [], // No shape colors for static images
                    background_color: 'rgb(255,255,255)',
                    layout_mode: 'image', // Special mode for static images
                    grid_rows: 1,
                    grid_cols: 1,
                    cell_width: null,
                    cell_height: null,
                    h_space: 0,
                    v_space: 0,
                    svg_content: null,
                    svg_path: storagePath, // Store the storage path
                    series_id: series.id,
                    created_at: new Date().toISOString()
                });

            if (dbError) {
                console.error(`❌ Error creating DB entry for ${filename}:`, dbError);
                continue;
            }

            console.log(`✅ Created database entry for ${filename}`);
        }

        console.log('\n🎉 Upload complete!');
        console.log(`📊 Series ID: ${series.id}`);
        console.log(`📁 Series name: ${series.name}`);
        console.log(`📸 Total images: ${files.length}`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

uploadImagesAndCreateGallery();
