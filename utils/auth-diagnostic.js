import supabase from './supabase';

/**
 * Diagnostic function to check Supabase auth status and configuration
 * Helps troubleshoot login issues
 */
export async function checkAuthStatus() {
  console.log('======= SUPABASE AUTH DIAGNOSTIC =======');
  
  try {
    // Check session
    console.log('1. Checking current session:');
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session exists:', Boolean(sessionData.session));
    
    // Check if we can access public data (tests connection & anon key)
    console.log('\n2. Testing database connection with anon key:');
    const { data: publicData, error: publicError } = await supabase
      .from('palette_gallery')
      .select('id')
      .limit(1);
      
    if (publicError) {
      console.error('- Public data access failed:', publicError.message);
      if (publicError.message.includes('JWTError')) {
        console.log('- JWT error detected: Your Supabase URL or key might be incorrect');
      } else if (publicError.message.includes('permission denied')) {
        console.log('- Permission denied: Check your RLS policies for public access');
      }
    } else {
      console.log('- Public data access successful');
    }
    
    // Test direct auth status endpoint
    console.log('\n3. Auth configuration check:');
    const { data: configData, error: configError } = await supabase.auth.getUser();
    console.log('- Auth configuration:', configError ? 'Error' : 'OK');
    console.log('- User data available:', Boolean(configData?.user));
    
    // Check palette gallery specific functionality
    console.log('\n3.3 Testing storage upload permissions (RLS policies):');
    try {
      // Try to upload a tiny test file to palette-gallery bucket
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const { error: uploadError } = await supabase
        .storage
        .from('palette-gallery')
        .upload(`test-${Date.now()}.txt`, testBlob, { upsert: true });
        
      if (uploadError) {
        console.error('❌ RLS Policy Error:', uploadError.message);
        console.log('Check /rls-policy-guide.md for instructions on fixing RLS policies.');
      } else {
        console.log('✅ Storage upload permissions OK');
      }
    } catch (e) {
      console.error('❌ Storage test error:', e.message);
    }
    
    // Check palette gallery table
    console.log('\n4. Testing database insertion permissions (RLS policies):');
    try {
      // Check if the URL column exists in palette_gallery
      const { data: columnData, error: columnError } = await supabase.rpc('exec_sql', {
        sql_statement: "SELECT column_name FROM information_schema.columns WHERE table_name = 'palette_gallery' AND column_name = 'url'"
      });
      
      if (columnError) {
        console.error('❌ Error checking schema:', columnError.message);
      } else if (!columnData || columnData.length === 0) {
        console.error('❌ Could not find the \'url\' column of \'palette_gallery\' in the schema cache');
        console.log('Visit /fix-rls to add the missing column.');
      } else {
        console.log('✅ Database schema looks good');
        
        // Test insertion permissions
        const { error: insertError } = await supabase.rpc('exec_sql', {
          sql_statement: "SELECT has_table_privilege(current_user, 'palette_gallery', 'INSERT') as can_insert"
        });
        
        if (insertError) {
          console.error('❌ Database insertion test failed:', insertError.message);
        } else {
          console.log('✅ Database insertion permissions OK');
        }
      }
    } catch (e) {
      console.error('❌ Database test error:', e.message);
    }
    
    // Log env variables (redacted for security)
    console.log('\n5. Environment variables check:');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    console.log('- NEXT_PUBLIC_SUPABASE_URL defined:', Boolean(supabaseUrl));
    console.log('- NEXT_PUBLIC_SUPABASE_URL format correct:', 
      supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'));
      
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY defined:', Boolean(supabaseKey));
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY format:', 
      supabaseKey.length > 20 ? 'Looks valid' : 'Possibly incorrect');
    
    // Return key info for display
    return {
      sessionExists: Boolean(sessionData.session),
      dbConnectionOk: !publicError,
      authConfigOk: !configError,
      envVarsOk: Boolean(supabaseUrl) && Boolean(supabaseKey) &&
        supabaseUrl.startsWith('https://') && supabaseKey.length > 20
    };
    
  } catch (e) {
    console.error('Auth diagnostic failed with exception:', e);
    return {
      error: e.message,
      sessionExists: false,
      dbConnectionOk: false,
      authConfigOk: false,
      envVarsOk: false
    };
  }
  
  console.log('======= END OF AUTH DIAGNOSTIC =======');
}

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  window.checkAuthStatus = checkAuthStatus;
}

// Test login function
export async function testLogin(email, password) {
  console.log('Testing login with provided credentials...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login test failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Login test successful!');
    return { success: true, user: data.user };
  } catch (e) {
    console.error('Login test exception:', e.message);
    return { success: false, error: e.message };
  }
}
