const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl ? 'loaded' : 'missing');
console.log('🔧 Supabase Key:', supabaseKey ? 'loaded' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSortOrderColumn() {
    try {
        console.log('🚀 Adding sort_order column to tables...');

        // Add sort_order column to shapeset_gallery
        console.log('📊 Adding sort_order to shapeset_gallery...');
        const { error: error1 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE shapeset_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;'
        });

        if (error1) {
            console.log('⚠️ Note: Using direct column add (RPC not available)');
            console.log('Please run this SQL manually in Supabase:');
            console.log('ALTER TABLE shapeset_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;');
            console.log('ALTER TABLE palette_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;');
        } else {
            console.log('✅ Added sort_order to shapeset_gallery');

            // Add sort_order column to palette_gallery
            console.log('📊 Adding sort_order to palette_gallery...');
            const { error: error2 } = await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE palette_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;'
            });

            if (error2) {
                console.error('❌ Error adding to palette_gallery:', error2);
            } else {
                console.log('✅ Added sort_order to palette_gallery');
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log('\nIf RPC failed, please run these SQL commands in Supabase SQL Editor:');
        console.log('```sql');
        console.log('ALTER TABLE shapeset_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;');
        console.log('ALTER TABLE palette_gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER;');
        console.log('```');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

addSortOrderColumn();
