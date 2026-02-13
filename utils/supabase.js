import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if values are available and provide console warnings if they're missing
if (!supabaseUrl || supabaseUrl === '') {
  console.warn('WARNING: Supabase URL is not set. Make sure NEXT_PUBLIC_SUPABASE_URL is configured in your environment variables.')
}

if (!supabaseKey || supabaseKey === '') {
  console.warn('WARNING: Supabase key is not set. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is configured in your environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'colormxr-auth',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    }
  }
})

export default supabase
