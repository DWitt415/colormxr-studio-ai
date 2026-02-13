'use client'

import { useState } from 'react'
import supabase from '@/utils/supabase'

export default function SupabaseTester() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState({})
  
  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testing Supabase connection...')
    
    try {
      // First, check if environment variables are set
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus('error')
        setMessage('Environment variables are not set correctly')
        setDetails({
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        })
        return
      }
      
      // Try to access a table
      const { data, error } = await supabase
        .from('palette_gallery')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        setStatus('error')
        setMessage('Failed to connect to Supabase')
        setDetails({
          error: error.message,
          code: error.code,
          hint: error.hint
        })
        return
      }
      
      // If no error, try to access storage buckets
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets()
        
      if (bucketError) {
        setStatus('warning')
        setMessage('Connected to database but could not access storage')
        setDetails({
          databaseConnected: true, 
          storageError: bucketError.message
        })
        return
      }
      
      // Check for palette-gallery bucket
      const paletteGalleryBucket = buckets.find(b => b.name === 'palette-gallery')
      
      setStatus('success')
      setMessage('Successfully connected to Supabase')
      setDetails({
        databaseConnected: true,
        storageConnected: true,
        buckets: buckets.map(b => b.name),
        paletteGalleryBucket: paletteGalleryBucket ? 'Found' : 'Not found'
      })
    } catch (error) {
      setStatus('error')
      setMessage('Unexpected error testing Supabase')
      setDetails({
        error: error.message
      })
    }
  }
  
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="font-medium text-lg mb-4">Supabase Connection Tester</h3>
      
      <div className="mb-4">
        <button 
          onClick={testConnection}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {status === 'testing' ? 'Testing...' : 'Test Supabase Connection'}
        </button>
      </div>
      
      {status !== 'idle' && (
        <div className={`p-4 rounded-md mt-4 ${
          status === 'testing' ? 'bg-blue-50 text-blue-800' :
          status === 'success' ? 'bg-green-50 text-green-800' :
          status === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          <p className="font-medium">{message}</p>
          
          {Object.keys(details).length > 0 && (
            <div className="mt-2 text-sm">
              <pre className="bg-white bg-opacity-50 p-2 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
