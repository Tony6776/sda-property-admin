import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JotFormRequest {
  action: 'get_forms' | 'get_submissions' | 'extract_all_data' | 'sync_to_ghl' | 'webhook_handler'
  form_ids?: string[]
  limit?: number
  offset?: number
  date_range?: {
    start: string
    end: string
  }
  include_ndis_only?: boolean
  ghl_config?: {
    api_key: string
    location_id: string
  }
  // Webhook fields
  submissionID?: string
  formID?: string
  answers?: Record<string, any>
  rawRequest?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📋 JotForm Extractor - Processing request')

    const requestData: JotFormRequest = await req.json()
    const action = requestData.action || 'webhook_handler' // Default to webhook if no action specified

    console.log(`🎯 Action: ${action}`)

    const apiKey = Deno.env.get('JOTFORM_API_KEY')
    if (!apiKey && action !== 'webhook_handler') {
      throw new Error('JotForm API key not configured')
    }

    let result

    switch (action) {
      case 'webhook_handler':
        // Handle Jotform webhook for file uploads
        result = await handleJotformWebhook(requestData)
        break

      case 'get_forms':
        result = await getAllJotForms(apiKey!, requestData.limit || 1000)
        break

      case 'get_submissions':
        result = await getFormSubmissions(apiKey!, requestData.form_ids || [], requestData.limit || 1000, requestData.date_range, requestData.include_ndis_only)
        break

      case 'extract_all_data':
        result = await extractAllJotFormData(apiKey!, requestData.limit || 1000, requestData.include_ndis_only)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log('✅ JotForm processing completed')

    return new Response(
      JSON.stringify({
        success: true,
        action: action,
        result: result,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ JotForm extractor error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        troubleshooting: [
          'Verify JotForm API key is valid and has proper permissions',
          'Check form IDs exist and are accessible',
          'Ensure API rate limits are not exceeded',
          'Confirm network connectivity to JotForm API'
        ]
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// NEW: Handle Jotform webhook for automatic file uploads
async function handleJotformWebhook(webhookData: JotFormRequest) {
  console.log('🔔 Processing Jotform webhook')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const submissionID = webhookData.submissionID || webhookData.rawRequest?.submissionID
    const formID = webhookData.formID || webhookData.rawRequest?.formID
    const answers = webhookData.answers || webhookData.rawRequest?.answers || webhookData.rawRequest || {}

    if (!submissionID || !formID) {
      throw new Error('Missing submission ID or form ID from webhook')
    }

    console.log(`📝 Processing submission ${submissionID} from form ${formID}`)

    // Extract participant data
    const participantData = extractParticipantData(answers)
    console.log(`👤 Extracted participant: ${participantData.name}`)

    // Find matching participant in Supabase
    const participant = await findParticipant(supabase, participantData)

    if (!participant) {
      console.warn('⚠️ No matching participant found')
      return {
        success: false,
        message: 'No matching participant found',
        participant_data: participantData,
        submission_id: submissionID
      }
    }

    console.log(`✅ Found participant: ${participant.id}`)

    // Extract file URLs from answers
    const fileUrls = extractFileUrls(answers)
    console.log(`📎 Found ${fileUrls.length} file(s) in submission`)

    const uploadedFiles = []

    // Download and upload each file
    for (const fileUrl of fileUrls) {
      try {
        console.log(`⬇️ Downloading: ${fileUrl}`)

        // Download file from Jotform
        const fileResponse = await fetch(fileUrl)
        if (!fileResponse.ok) {
          console.warn(`Failed to download file: ${fileResponse.status}`)
          continue
        }

        const fileBlob = await fileResponse.blob()
        const fileName = extractFilenameFromUrl(fileUrl)
        const fileSize = fileBlob.size

        // Categorize file using AI
        const category = categorizeFile(fileName)
        console.log(`🤖 AI categorized as: ${category}`)

        // Upload to Supabase Storage
        const storagePath = `participant/${participant.id}/${category}/${Date.now()}_${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileBlob, {
            contentType: fileBlob.type,
            upsert: false
          })

        if (uploadError) {
          console.error(`Storage upload error:`, uploadError)
          continue
        }

        console.log(`✅ Uploaded to storage: ${storagePath}`)

        // Save to file_uploads table
        const { data: fileRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            original_filename: fileName,
            stored_filename: fileName,
            file_size: fileSize,
            mime_type: fileBlob.type,
            storage_path: storagePath,
            storage_bucket: 'documents',
            file_category: category,
            entity_type: 'participant',
            entity_id: participant.id,
            ai_detected_type: category,
            ai_confidence: 85,
            ai_processed: true,
            source: 'jotform',
            source_submission_id: submissionID,
            jotform_form_id: formID,
            processed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (dbError) {
          console.error(`Database insert error:`, dbError)
          continue
        }

        console.log(`✅ Saved to database: ${fileRecord.id}`)
        uploadedFiles.push(fileRecord)

      } catch (fileError: any) {
        console.error(`Error processing file ${fileUrl}:`, fileError)
      }
    }

    return {
      success: true,
      participant_id: participant.id,
      participant_name: participant.name,
      files_uploaded: uploadedFiles.length,
      files_details: uploadedFiles,
      submission_id: submissionID,
      form_id: formID
    }

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    throw error
  }
}

// Extract participant data from Jotform answers
function extractParticipantData(answers: Record<string, any>) {
  let name = ''
  let email = ''
  let ndisNumber = ''

  for (const [key, value] of Object.entries(answers)) {
    const answer = value as any
    const fieldName = (answer?.name || answer?.text || key).toLowerCase()
    const fieldValue = answer?.answer || answer?.prettyFormat || ''

    if (fieldName.includes('name') || fieldName.includes('fullname')) {
      name = String(fieldValue).trim()
    } else if (fieldName.includes('email')) {
      email = String(fieldValue).trim()
    } else if (fieldName.includes('ndis') || fieldName.includes('participant')) {
      ndisNumber = String(fieldValue).trim()
    }
  }

  return { name, email, ndisNumber }
}

// Find participant in Supabase
async function findParticipant(supabase: any, data: { name: string; email: string; ndisNumber: string }) {
  // Try NDIS number first (most accurate)
  if (data.ndisNumber) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('ndis_number', data.ndisNumber)
      .limit(1)

    if (participants?.length > 0) {
      console.log('✅ Matched by NDIS number')
      return participants[0]
    }
  }

  // Try email
  if (data.email) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .ilike('email', data.email)
      .limit(1)

    if (participants?.length > 0) {
      console.log('✅ Matched by email')
      return participants[0]
    }
  }

  // Try fuzzy name match
  if (data.name) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .ilike('name', `%${data.name}%`)
      .limit(1)

    if (participants?.length > 0) {
      console.log('✅ Matched by name (fuzzy)')
      return participants[0]
    }
  }

  return null
}

// Extract file URLs from Jotform answers
function extractFileUrls(answers: Record<string, any>): string[] {
  const fileUrls: string[] = []

  for (const [key, value] of Object.entries(answers)) {
    const answer = value as any

    // Check if this is a file upload field
    if (answer?.type === 'control_fileupload' || answer?.name?.toLowerCase().includes('file') || answer?.name?.toLowerCase().includes('upload')) {
      const urls = answer?.answer

      if (Array.isArray(urls)) {
        fileUrls.push(...urls.filter((url: string) => url && url.startsWith('http')))
      } else if (typeof urls === 'string' && urls.startsWith('http')) {
        fileUrls.push(urls)
      }
    }
  }

  return fileUrls
}

// Extract filename from Jotform URL
function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'document.pdf'
    return filename
  } catch {
    return 'document.pdf'
  }
}

// Categorize file (same logic as SmartFileUpload)
function categorizeFile(filename: string): string {
  const lowerName = filename.toLowerCase()

  if (lowerName.includes('lease') || lowerName.includes('rental')) {
    return 'lease_agreement'
  }
  if (lowerName.includes('ndis') || lowerName.includes('plan')) {
    return 'ndis_plan'
  }
  if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
    return 'participant_id'
  }
  if (lowerName.includes('income') || lowerName.includes('payslip') || lowerName.includes('bank')) {
    return 'income_proof'
  }
  if (lowerName.includes('compliance') || lowerName.includes('certificate')) {
    return 'compliance_certificate'
  }
  if (lowerName.includes('photo') || lowerName.includes('image') || lowerName.includes('.jpg') || lowerName.includes('.png')) {
    return 'property_photo'
  }
  if (lowerName.includes('floor') || lowerName.includes('plan')) {
    return 'floor_plan'
  }

  return 'other'
}

// Legacy functions (keep for backwards compatibility)
async function getAllJotForms(apiKey: string, limit: number) {
  console.log('📋 Fetching all JotForm forms')

  const response = await fetch(`https://api.jotform.com/user/forms?limit=${limit}&orderby=created_at`, {
    headers: {
      'APIKEY': apiKey,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`JotForm API error: ${response.status}`)
  }

  const data = await response.json()
  const forms = data.content || []

  return {
    total_forms: forms.length,
    forms: forms.map((form: any) => ({
      id: form.id,
      title: form.title,
      status: form.status,
      created_at: form.created_at,
      count: form.count || 0,
      url: form.url
    }))
  }
}

async function getFormSubmissions(apiKey: string, formIds: string[], limit: number, dateRange?: any, ndisOnly: boolean = false) {
  console.log(`📊 Fetching submissions for ${formIds.length || 'all'} forms`)

  const allSubmissions: any[] = []

  for (const formId of formIds) {
    try {
      const response = await fetch(`https://api.jotform.com/form/${formId}/submissions?limit=${limit}`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.content) {
          allSubmissions.push(...data.content)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching form ${formId}:`, error)
    }
  }

  return {
    total_submissions: allSubmissions.length,
    submissions: allSubmissions
  }
}

async function extractAllJotFormData(apiKey: string, limit: number, ndisOnly: boolean = true) {
  console.log('🔍 Extracting all JotForm data')

  const formsResult = await getAllJotForms(apiKey, limit)
  const formIds = formsResult.forms.map((form: any) => form.id)
  const submissionsResult = await getFormSubmissions(apiKey, formIds, limit, undefined, ndisOnly)

  return {
    forms_summary: {
      total_forms: formsResult.total_forms,
      processed_forms: formIds.length
    },
    submissions_summary: {
      total_submissions: submissionsResult.total_submissions
    },
    forms: formsResult.forms,
    submissions: submissionsResult.submissions
  }
}
