// A simple test script to help diagnose SVG loading issues in Supabase

// Import the Supabase client
import supabase from './supabase';

// Function to test SVG loading
export async function testSVGLoading() {
  console.log("=== Testing SVG Loading from Supabase ===");
  
  try {
    // 1. Check if the bucket exists
    console.log("Checking if palette-gallery bucket exists...");
    const { data: bucketList, error: bucketError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketError) {
      console.error("Error listing buckets:", bucketError);
      return false;
    }
    
    const paletteBucket = bucketList.find(b => b.name === 'palette-gallery');
    if (!paletteBucket) {
      console.error("Bucket 'palette-gallery' not found! Available buckets:", 
        bucketList.map(b => b.name).join(', '));
      return false;
    }
    
    console.log("✅ Bucket 'palette-gallery' found!");
    
    // 2. List files in the bucket
    console.log("\nListing files in palette-gallery bucket...");
    const { data: fileList, error: fileError } = await supabase
      .storage
      .from('palette-gallery')
      .list();
      
    if (fileError) {
      console.error("Error listing files:", fileError);
      return false;
    }
    
    if (!fileList || fileList.length === 0) {
      console.log("No files found in the bucket. Try saving a palette first.");
      return true; // Not an error, just no files
    }
    
    console.log(`Found ${fileList.length} files in the bucket:`);
    fileList.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.metadata?.mimetype || 'unknown type'})`);
    });
    
    // 3. Check for SVG files
    const svgFiles = fileList.filter(file => 
      file.name.toLowerCase().endsWith('.svg') || 
      file.metadata?.mimetype === 'image/svg+xml'
    );
    
    console.log(`\nFound ${svgFiles.length} SVG files out of ${fileList.length} total files.`);
    
    // 4. Test getting URLs for SVG files
    if (svgFiles.length > 0) {
      console.log("\nTesting public URLs for SVG files:");
      
      for (const file of svgFiles.slice(0, 3)) { // Test up to 3 files
        const { data: urlData } = await supabase
          .storage
          .from('palette-gallery')
          .getPublicUrl(file.name);
          
        console.log(`- ${file.name}: ${urlData?.publicUrl || 'No URL returned'}`);
        
        // If URL was returned, test it with a HEAD request using fetch
        if (urlData?.publicUrl) {
          try {
            console.log(`  Testing URL: ${urlData.publicUrl}`);
            const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
            
            if (response.ok) {
              console.log(`  ✅ URL works! Status: ${response.status}`);
            } else {
              console.log(`  ❌ URL returned status: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.error(`  ❌ Error testing URL: ${error.message}`);
          }
        }
      }
    }
    
    // 5. Check palette_gallery database entries
    console.log("\nChecking palette_gallery database entries...");
    const { data: dbEntries, error: dbError } = await supabase
      .from('palette_gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (dbError) {
      console.error("Error querying database:", dbError);
      return false;
    }
    
    console.log(`Found ${dbEntries?.length || 0} recent entries in palette_gallery table.`);
    
    if (dbEntries && dbEntries.length > 0) {
      dbEntries.forEach((entry, index) => {
        console.log(`Entry ${index + 1}:`);
        console.log(`  ID: ${entry.id}`);
        console.log(`  Filename: ${entry.filename}`);
        console.log(`  URL: ${entry.url}`);
        
        // Verify if the URL in DB matches what we would get from storage
        if (entry.filename) {
          const { data: checkUrlData } = supabase
            .storage
            .from('palette-gallery')
            .getPublicUrl(entry.filename);
            
          const urlMatches = checkUrlData?.publicUrl === entry.url;
          console.log(`  URL in DB matches what we'd get from storage: ${urlMatches ? '✅ Yes' : '❌ No'}`);
          
          if (!urlMatches) {
            console.log(`  DB URL: ${entry.url}`);
            console.log(`  Expected URL: ${checkUrlData?.publicUrl}`);
          }
        }
        console.log("\n");
      });
    }
    
    console.log("=== SVG Loading Test Complete ===");
    return true;
    
  } catch (error) {
    console.error("Error during SVG loading test:", error);
    return false;
  }
}

// Execute the test if this script is run directly
if (typeof window !== 'undefined') {
  console.log("Run this test from the browser console by calling: testSVGLoading()");
  window.testSVGLoading = testSVGLoading;
}

export default testSVGLoading;
