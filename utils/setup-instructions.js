// filepath: /Users/dwitt/Sites/colormxr_dev/utils/setup-instructions.js
const fs = require('fs');
const path = require('path');

// Read SQL file
const sqlFilePath = path.join(__dirname, 'supabase-setup.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Read env file to get Supabase URL
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1] : 'your-supabase-url';

// Display SQL setup instructions
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
