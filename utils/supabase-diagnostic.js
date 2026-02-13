import supabase from './supabase';

/**
 * Run diagnostics on the Supabase connection and related services
 * You can import and call this function from your components during development
 */
export async function runSupabaseDiagnostic() {
  console.log('======= SUPABASE DIAGNOSTIC =======');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log('- SUPABASE_URL defined:', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.log('- SUPABASE_ANON_KEY defined:', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  
  try {
    // Test connection to Supabase
    console.log('\n2. Connection Test:');
    const { data: healthData, error: healthError } = await supabase.from('palette_gallery').select('id').limit(1);
    
    if (healthError) {
      console.error('- Connection test failed:', healthError);
    } else {
      console.log('- Connection successful!');
      console.log('- Response:', healthData);
    }
    
    // Check bucket access
    console.log('\n3. Storage Bucket Test:');
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .from('palette-gallery')
      .list('', { limit: 1 });
      
    if (bucketError) {
      console.error('- Bucket access failed:', bucketError);
      console.log('- Make sure the "palette-gallery" bucket exists in your Supabase project');
    } else {
      console.log('- Bucket access successful!');
      console.log('- Files found:', bucketData.length);
    }
    
    // Test a mock upload (without actually uploading)
    console.log('\n4. Upload Permission Test:');
    const mockBlob = new Blob(['test'], { type: 'text/plain' });
    const uploadPath = `test-${Date.now()}.txt`;
    
    try {
      const { error: uploadError } = await supabase
        .storage
        .from('palette-gallery')
        .upload(uploadPath, mockBlob, { upsert: true });
        
      if (uploadError) {
        console.error('- Upload permission test failed:', uploadError);
      } else {
        console.log('- Upload permission test successful!');
        
        // Clean up the test file
        await supabase.storage.from('palette-gallery').remove([uploadPath]);
        console.log('- Test file removed');
      }
    } catch (e) {
      console.error('- Upload test exception:', e);
    }
    
  } catch (e) {
    console.error('Diagnostic failed with exception:', e);
  }
  
  console.log('======= END OF DIAGNOSTIC =======');
}

// Add this to make it available in browser console for debugging
if (typeof window !== 'undefined') {
  window.runSupabaseDiagnostic = runSupabaseDiagnostic;
}
