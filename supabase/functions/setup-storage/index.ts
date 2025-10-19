// Storage Bucket Setup Edge Function
// Creates the "documents" bucket with proper configuration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with SERVICE ROLE (admin permissions)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔧 Setting up storage bucket...')

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      throw listError
    }

    console.log(`📦 Found ${buckets?.length || 0} existing buckets`)
    const existingBucket = buckets?.find(b => b.id === 'documents')

    if (existingBucket) {
      console.log('✅ Bucket "documents" already exists')

      // Update bucket configuration
      const { data: updateData, error: updateError } = await supabaseAdmin
        .storage
        .updateBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/zip',
            'application/x-zip-compressed'
          ]
        })

      if (updateError) {
        console.error('⚠️  Warning: Could not update bucket configuration:', updateError)
      } else {
        console.log('✅ Bucket configuration updated')
      }

    } else {
      console.log('📦 Creating new bucket "documents"...')

      // Create new bucket
      const { data: createData, error: createError } = await supabaseAdmin
        .storage
        .createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/zip',
            'application/x-zip-compressed'
          ]
        })

      if (createError) {
        console.error('❌ Error creating bucket:', createError)
        throw createError
      }

      console.log('✅ Bucket "documents" created successfully')
    }

    // Verify bucket exists
    const { data: verifyBuckets } = await supabaseAdmin.storage.listBuckets()
    const bucket = verifyBuckets?.find(b => b.id === 'documents')

    if (!bucket) {
      throw new Error('Bucket verification failed - bucket not found after creation')
    }

    console.log('✅ Storage bucket setup complete!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Storage bucket "documents" is ready',
        bucket: {
          id: bucket.id,
          name: bucket.name,
          public: bucket.public,
          file_size_limit: bucket.file_size_limit,
          allowed_mime_types: bucket.allowed_mime_types
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Storage setup failed:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
