import { NextResponse } from 'next/server';

// SECURITY NOTE: This is a development-only endpoint
// In production, this would be a security risk - only used for fixing issues
export async function POST(request) {
  try {
    // Verify this is running in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        error: 'This endpoint is only available in development mode'
      }, { status: 403 });
    }
    
    const { sql } = await request.json();
    
    if (!sql) {
      return NextResponse.json({
        error: 'No SQL provided'
      }, { status: 400 });
    }
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Supabase credentials not configured',
        message: 'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables'
      }, { status: 500 });
    }
    
    // Execute the SQL directly against Supabase using the service role key
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql_statement: sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Error executing SQL',
        details: errorText,
        statusCode: response.status
      }, { status: 500 });
    }
    
    const data = await response.json();
    return NextResponse.json({
      message: 'SQL executed successfully',
      result: data
    });
  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json({
      error: 'Error executing SQL',
      message: error.message
    }, { status: 500 });
  }
}
