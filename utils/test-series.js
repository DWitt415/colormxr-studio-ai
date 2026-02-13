// Test script for series functionality
import supabase from './supabase';

/**
 * This script tests the series functionality for both composition and palette galleries.
 * It performs the following checks:
 * 1. Verifies series tables exist
 * 2. Checks if there are any existing series
 * 3. Creates test series if needed
 * 4. Verifies thumbnail assignment works
 */

async function runSeriesTests() {
    console.log('Running series functionality tests...');
    
    // 1. Check if series_gallery table exists
    try {
        const { data: seriesData, error: seriesError } = await supabase
            .from('series_gallery')
            .select('count(*)')
            .limit(1);
            
        if (seriesError) {
            console.error('Error checking series_gallery table:', seriesError.message);
            console.log('Make sure to run the create-series-tables.sql script first');
            return;
        }
        
        console.log('✓ series_gallery table exists');
    } catch (err) {
        console.error('Failed to query series_gallery table:', err.message);
        return;
    }
    
    // 2. Check existing series
    try {
        const { data: compositionSeries, error: compError } = await supabase
            .from('series_gallery')
            .select('*')
            .eq('type', 'composition');
            
        if (compError) throw compError;
        
        const { data: paletteSeries, error: palError } = await supabase
            .from('series_gallery')
            .select('*')
            .eq('type', 'palette');
            
        if (palError) throw palError;
        
        console.log(`Found ${compositionSeries.length} composition series`);
        console.log(`Found ${paletteSeries.length} palette series`);
        
        // 3. Test creating a sample series if none exist
        if (compositionSeries.length === 0) {
            await createTestSeries('composition');
        }
        
        if (paletteSeries.length === 0) {
            await createTestSeries('palette');
        }
        
        // 4. Test thumbnail assignment
        await testThumbnailAssignment('composition');
        await testThumbnailAssignment('palette');
        
        console.log('All series tests completed!');
        
    } catch (err) {
        console.error('Error during series tests:', err.message);
    }
}

/**
 * Create a test series of the given type
 */
async function createTestSeries(type) {
    try {
        // Create a test series
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).replace(/\//g, '-');
        
        const seriesName = `${dateString} test series`;
        
        const { data: seriesData, error: seriesError } = await supabase
            .from('series_gallery')
            .insert({
                name: seriesName,
                type,
                created_at: new Date().toISOString()
            })
            .select();
            
        if (seriesError) throw seriesError;
        
        console.log(`Created test ${type} series: ${seriesName}`);
        
        // Find items that aren't in a series yet to add to our test series
        const tableName = type === 'composition' ? 'shapeset_gallery' : 'palette_gallery';
        
        const { data: items, error: itemsError } = await supabase
            .from(tableName)
            .select('id')
            .is('series_id', null)
            .limit(3);
            
        if (itemsError) throw itemsError;
        
        if (items && items.length > 0) {
            // Update items to belong to this series
            const { error: updateError } = await supabase
                .from(tableName)
                .update({ series_id: seriesData[0].id })
                .in('id', items.map(i => i.id));
                
            if (updateError) throw updateError;
            
            console.log(`Added ${items.length} items to the test ${type} series`);
        } else {
            console.log(`No ${type} items available to add to test series`);
        }
        
    } catch (err) {
        console.error(`Error creating test ${type} series:`, err.message);
    }
}

/**
 * Test that the thumbnail assignment works correctly
 */
async function testThumbnailAssignment(type) {
    try {
        // Get a series of the specified type
        const { data: series, error: seriesError } = await supabase
            .from('series_gallery')
            .select('id, name')
            .eq('type', type)
            .limit(1)
            .single();
            
        if (seriesError) throw seriesError;
        
        if (!series) {
            console.log(`No ${type} series found to test thumbnail assignment`);
            return;
        }
        
        // Get items in this series
        const tableName = type === 'composition' ? 'shapeset_gallery' : 'palette_gallery';
        
        const { data: items, error: itemsError } = await supabase
            .from(tableName)
            .select('id')
            .eq('series_id', series.id)
            .limit(1)
            .single();
            
        if (itemsError) throw itemsError;
        
        if (!items) {
            console.log(`No items found in ${type} series to test thumbnail assignment`);
            return;
        }
        
        // Set the item as the thumbnail for the series
        const { error: updateError } = await supabase
            .from('series_gallery')
            .update({ thumbnail_id: items.id })
            .eq('id', series.id);
            
        if (updateError) throw updateError;
        
        console.log(`✓ Successfully set thumbnail for ${type} series: ${series.name}`);
        
    } catch (err) {
        console.error(`Error testing thumbnail assignment for ${type} series:`, err.message);
    }
}

// Run the tests
runSeriesTests();
