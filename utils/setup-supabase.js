// filepath: /Users/dwitt/Sites/colormxr_dev/utils/setup-supabase.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get the directory name
const __dirname = path.resolve();

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^(.*?)=(.*)$/);
  if (match) {
    acc[match[1]] = match[2];
  }
  return acc;
}, {});

// Create Supabase client
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key missing in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlFilePath = path.resolve(__dirname, 'utils', 'supabase-setup.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Function to display SQL setup instructions
function displaySetupInstructions() {
  console.log('='.repeat(80));
  console.log('SUPABASE SETUP INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log('\nPlease perform these steps in the Supabase dashboard:');
  console.log('\n1. Go to https://app.supabase.io');
  console.log(`2. Sign in and select your project: ${supabaseUrl}`);
  console.log('3. Go to SQL Editor and run the following SQL:');
  console.log('\n' + '-'.repeat(80));
  console.log(sqlContent);
  console.log('-'.repeat(80));
  
  console.log('\n4. Create a storage bucket:');
  console.log('   a. Go to Storage in the dashboard');
  console.log('   b. Click "Create bucket"');
  console.log('   c. Enter "gallery" as the name');
  console.log('   d. Enable public bucket access');
  
  console.log('\n5. Set bucket policies:');
  console.log('   a. Go to the Storage > Policies section');
  console.log('   b. Add policy for SELECT operations: Allow public access');
  console.log('   c. Add policy for INSERT operations: Allow public access');
  
  console.log('\n6. After completing these steps, your Supabase setup will be complete');
  console.log('\nYou can test the setup by running the application and trying to save a shapeset');
  console.log('='.repeat(80));
}

// Run the setup instructions
displaySetupInstructions();
