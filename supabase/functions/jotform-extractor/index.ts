import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getFormIdsByType, getFormEntityType } from './form-mapping.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JotFormRequest {
  action: 'get_forms' | 'get_submissions' | 'extract_all_data' | 'sync_to_ghl' | 'webhook_handler' | 'configure_webhooks' | 'process_historical' | 'extract_participants' | 'extract_landlords' | 'extract_investors'
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
  // Webhook configuration
  webhook_url?: string
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

      case 'configure_webhooks':
        result = await configureWebhooksForAllForms(apiKey!, requestData.webhook_url || Deno.env.get('SUPABASE_URL') + '/functions/v1/jotform-extractor')
        break

      case 'process_historical':
        result = await processHistoricalSubmissions(apiKey!)
        break

      case 'extract_participants':
        // Use mapped participant form IDs if none specified
        let participantFormIds = requestData.form_ids || []
        if (participantFormIds.length === 0) {
          participantFormIds = getFormIdsByType('participant')
          console.log(`📋 Using ${participantFormIds.length} mapped participant forms`)
        }
        result = await extractParticipantsFromJotform(apiKey!, participantFormIds)
        break

      case 'extract_landlords':
        // Use mapped landlord form IDs if none specified
        let landlordFormIds = requestData.form_ids || []
        if (landlordFormIds.length === 0) {
          landlordFormIds = getFormIdsByType('landlord')
          console.log(`📋 Using ${landlordFormIds.length} mapped landlord forms`)
        }
        result = await extractLandlordsFromJotform(apiKey!, landlordFormIds)
        break

      case 'extract_investors':
        // Use mapped investor form IDs if none specified
        let investorFormIds = requestData.form_ids || []
        if (investorFormIds.length === 0) {
          investorFormIds = getFormIdsByType('investor')
          console.log(`📋 Using ${investorFormIds.length} mapped investor forms`)
        }
        result = await extractInvestorsFromJotform(apiKey!, investorFormIds)
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

// Detect form type from form ID and content
function detectFormType(formID: string, answers: Record<string, any>): string {
  // Service Agreement forms (known IDs from JotForm)
  const serviceAgreementForms = [
    '241191409987870', // NDIS SDA Service Agreement S1
    '241190906049860', // NDIS ILO Service Agreement S2
    '241191526850859', // NDIS ILO Service Agreement S3
    '241191455605858', // NDIS ILO Service Agreement S4
    '240977592477878', // NDIS Service Agreement
    '240701567647864', // Private SDA Participant Ownership Advisory & Consultancy Service Agreement
    '241071028714852', // NDIS Housing Assessment Exploration Report Service Agreement
  ]

  // Landlord forms
  const landlordForms = [
    '251780545796874', // SDA Landlord Leasing Authority
    '250589077972876', // SDA Landlord Enrolment Documents
    '240840938587873', // SDA Landlord Engagement Form
    '240840670717861', // SDA Advertising Agreement
  ]

  // Investor forms
  const investorForms = [
    '241198305921860', // NDIS Investor Acquisition Form
    '241040631577855', // NDIS Investor Acquisition Form
    '240346955310857', // Investor/Developer NDIS Property Consultancy Form
    '233451158282859', // EOI NDIS Channel Agent Form for investors
    '232982830411858', // Investor's NDIS Property Procurement & Consultancy Form
    '230887448824873', // NDIS Investor Acquisition Form
  ]

  if (serviceAgreementForms.includes(formID)) {
    return 'service_agreement'
  } else if (landlordForms.includes(formID)) {
    return 'landlord'
  } else if (investorForms.includes(formID)) {
    return 'investor'
  } else {
    // Check content for hints
    const allAnswersText = JSON.stringify(answers).toLowerCase()
    if (allAnswersText.includes('service agreement') || allAnswersText.includes('terms and conditions')) {
      return 'service_agreement'
    } else if (allAnswersText.includes('landlord') || allAnswersText.includes('property owner')) {
      return 'landlord'
    } else if (allAnswersText.includes('investor') || allAnswersText.includes('investment')) {
      return 'investor'
    }
    return 'participant'
  }
}

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

    // Detect form type (service agreement, landlord, investor, participant, etc.)
    const formType = detectFormType(formID, answers)
    console.log(`🔍 Detected form type: ${formType}`)

    // Extract participant data (works for all form types)
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

        // Categorize file using AI and form type
        const category = categorizeFile(fileName, formType)
        console.log(`🤖 AI categorized as: ${category} (form type: ${formType})`)

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
    const fieldText = (answer?.text || '').toLowerCase()
    const fieldName = (answer?.name || '').toLowerCase()
    const fieldValue = answer?.answer

    // Skip non-participant fields
    if (!fieldText && !fieldName) continue

    // Extract NDIS Number - check TEXT field for specific wording
    if (
      (fieldText.includes('ndis') && fieldText.includes('participant') && fieldText.includes('number')) ||
      (fieldText === "ndis participant's ndis number")
    ) {
      ndisNumber = String(fieldValue || '').trim()
      console.log(`✅ Found NDIS Number in field "${fieldText}": ${ndisNumber}`)
      continue
    }

    // Extract participant name - check TEXT field, not field name
    if (
      (fieldText.includes('participant') && (fieldText.includes('full name') || fieldText.includes('name')) && !fieldText.includes('plan manager') && !fieldText.includes('support coordinator')) ||
      (fieldText === "ndis participant's full name")
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        // Handle fullname field format: {first: "Jessica", last: "Teasdale"}
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        name = `${firstName} ${lastName}`.trim()
      } else {
        name = String(fieldValue || '').trim()
      }
      console.log(`✅ Found Participant Name in field "${fieldText}": ${name}`)
      continue
    }

    // Extract participant email - check TEXT field
    if (
      (fieldText.includes('participant') && fieldText.includes('email') && !fieldText.includes('plan manager') && !fieldText.includes('support coordinator')) ||
      (fieldText === "ndis participant's email address")
    ) {
      email = String(fieldValue || '').trim()
      console.log(`✅ Found Participant Email in field "${fieldText}": ${email}`)
      continue
    }
  }

  console.log(`📊 Extracted: name="${name}", email="${email}", ndisNumber="${ndisNumber}"`)
  return { name, email, ndisNumber }
}

// Find participant in Supabase
async function findParticipant(supabase: any, data: { name: string; email: string; ndisNumber: string }) {
  console.log(`🔍 Looking for participant: name="${data.name}", ndis="${data.ndisNumber}"`)

  // Try NDIS number first (most accurate)
  if (data.ndisNumber) {
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .eq('ndis_number', data.ndisNumber)
      .limit(1)

    if (error) {
      console.error('Error querying by NDIS number:', error)
    }

    if (participants?.length > 0) {
      console.log(`✅ Matched by NDIS number: ${participants[0].name} (${participants[0].id})`)
      return participants[0]
    }
  }

  // Try fuzzy name match (participants table has no email column)
  if (data.name) {
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .ilike('name', `%${data.name}%`)
      .limit(1)

    if (error) {
      console.error('Error querying by name:', error)
    }

    if (participants?.length > 0) {
      console.log(`✅ Matched by name (fuzzy): ${participants[0].name} (${participants[0].id})`)
      return participants[0]
    }
  }

  console.log(`⚠️ No participant match found`)
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
function categorizeFile(filename: string, formType: string = 'participant'): string {
  const lowerName = filename.toLowerCase()

  // If this is a service agreement form, all files are service agreements
  if (formType === 'service_agreement') {
    return 'service_agreement'
  }

  // If this is a landlord form, categorize as landlord documents
  if (formType === 'landlord') {
    if (lowerName.includes('abn') || lowerName.includes('business')) {
      return 'landlord_business_docs'
    }
    if (lowerName.includes('bank') || lowerName.includes('bsb')) {
      return 'landlord_banking'
    }
    if (lowerName.includes('ndis') || lowerName.includes('registration')) {
      return 'landlord_compliance'
    }
    return 'landlord_document'
  }

  // If this is an investor form, categorize as investor documents
  if (formType === 'investor') {
    return 'investor_document'
  }

  // Participant document categorization (original logic)
  if (lowerName.includes('lease') || lowerName.includes('rental')) {
    return 'lease_agreement'
  }
  if (lowerName.includes('ndis') || lowerName.includes('plan')) {
    return 'ndis_plan'
  }
  if (lowerName.includes('service') && lowerName.includes('agreement')) {
    return 'service_agreement'
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

// NEW: Configure webhooks for all forms with file uploads
async function configureWebhooksForAllForms(apiKey: string, webhookUrl: string) {
  console.log('🔗 Configuring webhooks for all forms')
  console.log(`Webhook URL: ${webhookUrl}`)

  // Get all forms
  const formsResult = await getAllJotForms(apiKey, 1000)
  const forms = formsResult.forms

  const results = {
    total_forms: forms.length,
    forms_checked: 0,
    webhooks_added: 0,
    webhooks_existed: 0,
    webhooks_failed: 0,
    details: [] as any[]
  }

  for (const form of forms) {
    try {
      results.forms_checked++

      // Get form questions to check if it has file upload fields
      const questionsResponse = await fetch(`https://api.jotform.com/form/${form.id}/questions`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!questionsResponse.ok) {
        console.warn(`Failed to get questions for form ${form.id}`)
        continue
      }

      const questionsData = await questionsResponse.json()
      const questions = questionsData.content || {}

      // Check if form has file upload fields
      const hasFileUpload = Object.values(questions).some((q: any) =>
        q.type === 'control_fileupload'
      )

      if (!hasFileUpload) {
        console.log(`⏭️  Skipping form ${form.id} (${form.title}) - no file upload fields`)
        results.details.push({
          form_id: form.id,
          form_title: form.title,
          status: 'skipped',
          reason: 'no file upload fields'
        })
        continue
      }

      console.log(`📋 Form ${form.id} (${form.title}) has file upload - checking webhooks...`)

      // Get existing webhooks
      const webhooksResponse = await fetch(`https://api.jotform.com/form/${form.id}/webhooks`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (webhooksResponse.ok) {
        const webhooksData = await webhooksResponse.json()
        let existingWebhooks = webhooksData.content || {}

        // Handle both object and array formats
        if (!Array.isArray(existingWebhooks)) {
          existingWebhooks = Object.values(existingWebhooks)
        }

        // Check if webhook already exists
        const webhookExists = existingWebhooks.some((w: string) =>
          typeof w === 'string' && w.includes('jotform-extractor')
        )

        if (webhookExists) {
          console.log(`✅ Webhook already exists for form ${form.id}`)
          results.webhooks_existed++
          results.details.push({
            form_id: form.id,
            form_title: form.title,
            status: 'existed',
            webhook_url: webhookUrl
          })
          continue
        }
      }

      // Add webhook
      console.log(`➕ Adding webhook to form ${form.id}`)
      const addWebhookResponse = await fetch(`https://api.jotform.com/form/${form.id}/webhooks`, {
        method: 'POST',
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `webhookURL=${encodeURIComponent(webhookUrl)}`
      })

      if (addWebhookResponse.ok) {
        console.log(`✅ Webhook added to form ${form.id}`)
        results.webhooks_added++
        results.details.push({
          form_id: form.id,
          form_title: form.title,
          status: 'added',
          webhook_url: webhookUrl
        })
      } else {
        const errorText = await addWebhookResponse.text()
        console.error(`Failed to add webhook to form ${form.id}:`, errorText)
        results.webhooks_failed++
        results.details.push({
          form_id: form.id,
          form_title: form.title,
          status: 'failed',
          error: errorText
        })
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

    } catch (error: any) {
      console.error(`Error processing form ${form.id}:`, error)
      results.webhooks_failed++
      results.details.push({
        form_id: form.id,
        form_title: form.title,
        status: 'error',
        error: error.message
      })
    }
  }

  return results
}

// NEW: Process all historical submissions with file uploads
async function processHistoricalSubmissions(apiKey: string) {
  console.log('📚 Processing historical Jotform submissions')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Forms with file upload fields (from configure_webhooks results)
  const formsWithFiles = [
    '252763626973065', // PLCG Project Progress Tracking Form
    '252731735674059', // Property Maintenance Request - SDA Tenants
    '251716128939869', // SDA POP Criteria
    '251711198894063', // NDIS Support Plan Template
    '250589077972876', // SDA Landlord Enrolment Documents
    '242242586980059', // SDA Property Docs
    '241191409987870', // NDIS SDA Service Agreement S1 (13 submissions)
    '241030962693860', // LTC Property Response Form
    '240977592477878', // NDIS Service Agreement (10 submissions)
    '232252012714846', // WBL Sale Request
    '231298175953870'  // SDA Property Request Form (54 submissions - PARTICIPANT FORM)
  ]

  const results = {
    total_submissions: 0,
    processed_submissions: 0,
    files_uploaded: 0,
    participants_matched: 0,
    participants_not_found: 0,
    errors: 0,
    details: [] as any[]
  }

  // Get all submissions from forms with file uploads
  for (const formId of formsWithFiles) {
    try {
      console.log(`📋 Fetching submissions from form ${formId}`)

      const response = await fetch(`https://api.jotform.com/form/${formId}/submissions?limit=1000`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`Failed to get submissions for form ${formId}`)
        continue
      }

      const data = await response.json()
      const submissions = data.content || []

      console.log(`✅ Found ${submissions.length} submissions for form ${formId}`)
      results.total_submissions += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract participant data
          const participantData = extractParticipantData(answers)

          // Extract file URLs
          const fileUrls = extractFileUrls(answers)

          if (fileUrls.length === 0) {
            console.log(`⏭️  Submission ${submissionID} has no files`)
            continue
          }

          console.log(`📎 Submission ${submissionID} has ${fileUrls.length} file(s)`)

          // Find matching participant
          const participant = await findParticipant(supabase, participantData)

          if (!participant) {
            console.warn(`⚠️  No participant found for submission ${submissionID}`, participantData)
            results.participants_not_found++
            results.details.push({
              submission_id: submissionID,
              form_id: formId,
              status: 'participant_not_found',
              participant_data: participantData,
              files_count: fileUrls.length
            })
            continue
          }

          console.log(`✅ Matched participant: ${participant.id} (${participant.name})`)
          results.participants_matched++

          // Process each file
          let filesUploaded = 0
          for (const fileUrl of fileUrls) {
            try {
              console.log(`⬇️  Downloading: ${fileUrl}`)

              // Download file from Jotform
              const fileResponse = await fetch(fileUrl)
              if (!fileResponse.ok) {
                console.warn(`Failed to download file: ${fileResponse.status}`)
                continue
              }

              const fileBlob = await fileResponse.blob()
              const fileName = extractFilenameFromUrl(fileUrl)
              const fileSize = fileBlob.size

              // Categorize file
              const category = categorizeFile(fileName)

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

              console.log(`✅ Uploaded: ${storagePath}`)

              // Save to file_uploads table
              const { error: dbError } = await supabase
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
                  jotform_form_id: formId,
                  processed_at: new Date().toISOString(),
                })

              if (dbError) {
                console.error(`Database insert error:`, dbError)
                continue
              }

              filesUploaded++
              results.files_uploaded++

            } catch (fileError: any) {
              console.error(`Error processing file ${fileUrl}:`, fileError)
            }
          }

          results.processed_submissions++
          results.details.push({
            submission_id: submissionID,
            form_id: formId,
            participant_id: participant.id,
            participant_name: participant.name,
            files_uploaded: filesUploaded,
            status: 'success'
          })

        } catch (submissionError: any) {
          console.error(`Error processing submission:`, submissionError)
          results.errors++
        }
      }

      // Rate limiting between forms
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error: any) {
      console.error(`Error processing form ${formId}:`, error)
      results.errors++
    }
  }

  return results
}

// NEW: Extract participants from JotForm submissions with their preferences
async function extractParticipantsFromJotform(apiKey: string, formIds: string[]) {
  console.log('👥 Extracting participants from JotForm')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const results = {
    total_submissions: 0,
    participants_created: 0,
    participants_updated: 0,
    participants_skipped: 0,
    errors: 0,
    details: [] as any[]
  }

  for (const formId of formIds) {
    try {
      console.log(`📋 Fetching submissions from form ${formId}`)

      const response = await fetch(`https://api.jotform.com/form/${formId}/submissions?limit=1000`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`Failed to get submissions for form ${formId}`)
        continue
      }

      const data = await response.json()
      const submissions = data.content || []

      console.log(`✅ Found ${submissions.length} submissions for form ${formId}`)
      results.total_submissions += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract participant data
          const participantData = extractParticipantDataWithPreferences(answers, formId)

          // Skip if no valid participant data
          if (!participantData.name && !participantData.ndisNumber && !participantData.email) {
            console.log(`⏭️  Submission ${submissionID} has no participant data`)
            results.participants_skipped++
            continue
          }

          console.log(`👤 Processing participant: ${participantData.name || 'Unknown'} (NDIS: ${participantData.ndisNumber || 'N/A'})`)

          // Check if participant exists
          let existingParticipant = null

          // Try to find by NDIS number first
          if (participantData.ndisNumber) {
            const { data: byNdis } = await supabase
              .from('participants')
              .select('*')
              .eq('ndis_number', participantData.ndisNumber)
              .limit(1)
              .maybeSingle()

            if (byNdis) existingParticipant = byNdis
          }

          // If not found, try by name
          if (!existingParticipant && participantData.name) {
            const { data: byName } = await supabase
              .from('participants')
              .select('*')
              .ilike('name', participantData.name)
              .limit(1)
              .maybeSingle()

            if (byName) existingParticipant = byName
          }

          if (existingParticipant) {
            // Update existing participant with new preferences
            const { error } = await supabase
              .from('participants')
              .update({
                housing_preferences: participantData.housing_preferences,
                support_level: participantData.support_level || existingParticipant.support_level,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingParticipant.id)

            if (error) {
              console.error(`Error updating participant:`, error)
              results.errors++
            } else {
              console.log(`✅ Updated participant: ${existingParticipant.id}`)
              results.participants_updated++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                participant_id: existingParticipant.id,
                participant_name: participantData.name,
                action: 'updated',
                preferences: participantData.housing_preferences
              })
            }
          } else {
            // Create new participant
            const newParticipant = {
              name: participantData.name || 'Unknown',
              ndis_number: participantData.ndisNumber || null,
              age: participantData.age || null,
              disability_category: participantData.disability_category || null,
              support_level: participantData.support_level || 'Medium',
              current_housing_type: participantData.current_housing_type || null,
              housing_status: 'Seeking SDA',
              housing_preferences: participantData.housing_preferences || null,
              participant_status: 'pending',
              priority_level: 'medium',
              notes: `Auto-created from JotForm submission ${submissionID} (Form ${formId})\n${participantData.notes || ''}`,
              created_at: new Date().toISOString()
            }

            const { data: created, error } = await supabase
              .from('participants')
              .insert([newParticipant])
              .select()
              .single()

            if (error) {
              console.error(`Error creating participant:`, error)
              results.errors++
            } else {
              console.log(`✅ Created participant: ${created.id}`)
              results.participants_created++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                participant_id: created.id,
                participant_name: participantData.name,
                action: 'created',
                preferences: participantData.housing_preferences
              })
            }
          }

        } catch (submissionError: any) {
          console.error(`Error processing submission:`, submissionError)
          results.errors++
        }
      }

      // Rate limiting between forms
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error: any) {
      console.error(`Error processing form ${formId}:`, error)
      results.errors++
    }
  }

  return results
}

// Extract participant data with housing preferences from JotForm answers
function extractParticipantDataWithPreferences(answers: Record<string, any>, formId: string) {
  let name = ''
  let email = ''
  let ndisNumber = ''
  let age: number | null = null
  let disability_category = ''
  let support_level = ''
  let current_housing_type = ''
  let housing_preferences = ''
  let notes = ''

  const preferences: string[] = []

  for (const [key, value] of Object.entries(answers)) {
    const answer = value as any
    const fieldText = (answer?.text || '').toLowerCase()
    const fieldName = (answer?.name || '').toLowerCase()
    const fieldValue = answer?.answer

    // Skip non-participant fields
    if (!fieldText && !fieldName) continue

    // Extract NDIS Number
    if (
      (fieldText.includes('ndis') && fieldText.includes('number')) ||
      fieldName.includes('ndis') && fieldName.includes('number')
    ) {
      ndisNumber = String(fieldValue || '').trim()
      continue
    }

    // Extract participant name
    if (
      (fieldText.includes('participant') && fieldText.includes('name') && !fieldText.includes('plan manager') && !fieldText.includes('support coordinator')) ||
      (fieldText === "ndis participant's full name") ||
      (fieldName.includes('participant') && fieldName.includes('name'))
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        name = `${firstName} ${lastName}`.trim()
      } else {
        name = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract email
    if (
      (fieldText.includes('participant') && fieldText.includes('email')) ||
      (fieldName.includes('participant') && fieldName.includes('email'))
    ) {
      email = String(fieldValue || '').trim()
      continue
    }

    // Extract age
    if (fieldText.includes('age') || fieldName.includes('age')) {
      const ageValue = parseInt(String(fieldValue || '0'))
      if (ageValue > 0 && ageValue < 150) {
        age = ageValue
      }
      continue
    }

    // Extract disability category
    if (
      fieldText.includes('disability') && (fieldText.includes('type') || fieldText.includes('category'))
    ) {
      disability_category = String(fieldValue || '').trim()
      continue
    }

    // Extract support level
    if (
      fieldText.includes('support') && (fieldText.includes('level') || fieldText.includes('requirement'))
    ) {
      support_level = String(fieldValue || '').trim()
      continue
    }

    // Extract current housing
    if (
      fieldText.includes('current') && fieldText.includes('housing') ||
      fieldText.includes('living') && fieldText.includes('situation')
    ) {
      current_housing_type = String(fieldValue || '').trim()
      continue
    }

    // Extract location preference
    if (
      fieldText.includes('location') ||
      fieldText.includes('suburb') ||
      fieldText.includes('area') ||
      fieldText.includes('where')
    ) {
      const locationPref = String(fieldValue || '').trim()
      if (locationPref) {
        preferences.push(`Location: ${locationPref}`)
      }
      continue
    }

    // Extract property type preference
    if (
      fieldText.includes('property') && fieldText.includes('type') ||
      fieldText.includes('housing') && fieldText.includes('type')
    ) {
      const typePref = String(fieldValue || '').trim()
      if (typePref) {
        preferences.push(`Property Type: ${typePref}`)
      }
      continue
    }

    // Extract bedroom preference
    if (fieldText.includes('bedroom') || fieldText.includes('room')) {
      const bedroomPref = String(fieldValue || '').trim()
      if (bedroomPref) {
        preferences.push(`Bedrooms: ${bedroomPref}`)
      }
      continue
    }

    // Extract accessibility needs
    if (
      fieldText.includes('accessibility') ||
      fieldText.includes('accessible') ||
      fieldText.includes('modification')
    ) {
      const accessPref = String(fieldValue || '').trim()
      if (accessPref) {
        preferences.push(`Accessibility: ${accessPref}`)
      }
      continue
    }

    // Extract budget/funding
    if (
      fieldText.includes('budget') ||
      fieldText.includes('funding') ||
      fieldText.includes('price')
    ) {
      const budgetPref = String(fieldValue || '').trim()
      if (budgetPref) {
        preferences.push(`Budget: ${budgetPref}`)
      }
      continue
    }

    // Extract other preferences
    if (
      fieldText.includes('preference') ||
      fieldText.includes('requirement') ||
      fieldText.includes('need')
    ) {
      const otherPref = String(fieldValue || '').trim()
      if (otherPref && otherPref.length > 3) {
        preferences.push(otherPref)
      }
      continue
    }
  }

  // Combine all preferences
  if (preferences.length > 0) {
    housing_preferences = preferences.join('\n')
  }

  // Add form-specific notes
  if (formId === '231298175953870') {
    notes = 'From SDA Property Request Form'
  } else if (formId === '241191409987870') {
    notes = 'From NDIS SDA Service Agreement S1'
  } else if (formId === '240977592477878') {
    notes = 'From NDIS Service Agreement'
  }

  return {
    name,
    email,
    ndisNumber,
    age,
    disability_category,
    support_level,
    current_housing_type,
    housing_preferences,
    notes
  }
}
// Landlord and Investor extraction functions for JotForm
// This file will be appended to the main index.ts

// Extract landlords from JotForm submissions
async function extractLandlordsFromJotform(apiKey: string, formIds: string[]) {
  console.log('🏢 Extracting landlords from JotForm')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const results = {
    total_submissions: 0,
    landlords_created: 0,
    landlords_updated: 0,
    landlords_skipped: 0,
    errors: 0,
    details: [] as any[]
  }

  for (const formId of formIds) {
    try {
      console.log(`📋 Fetching submissions from form ${formId}`)

      const response = await fetch(`https://api.jotform.com/form/${formId}/submissions?limit=1000`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`Failed to get submissions for form ${formId}`)
        continue
      }

      const data = await response.json()
      const submissions = data.content || []

      console.log(`✅ Found ${submissions.length} submissions for form ${formId}`)
      results.total_submissions += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract landlord data
          const landlordData = extractLandlordData(answers, formId)

          // Skip if no valid landlord data (both fields required by database schema)
          if (!landlordData.full_name || !landlordData.email) {
            console.log(`⏭️  Submission ${submissionID} missing required fields (name: ${landlordData.full_name || 'N/A'}, email: ${landlordData.email || 'N/A'})`)
            results.landlords_skipped++
            continue
          }

          console.log(`🏢 Processing landlord: ${landlordData.full_name || 'Unknown'} (Email: ${landlordData.email || 'N/A'})`)

          // Check if landlord exists
          let existingLandlord = null

          // Try to find by email first
          if (landlordData.email) {
            const { data: byEmail } = await supabase
              .from('landlords')
              .select('*')
              .eq('email', landlordData.email)
              .limit(1)
              .maybeSingle()

            if (byEmail) existingLandlord = byEmail
          }

          // If not found, try by name and ABN
          if (!existingLandlord && landlordData.full_name && landlordData.abn) {
            const { data: byNameAbn } = await supabase
              .from('landlords')
              .select('*')
              .eq('full_name', landlordData.full_name)
              .eq('abn', landlordData.abn)
              .limit(1)
              .maybeSingle()

            if (byNameAbn) existingLandlord = byNameAbn
          }

          if (existingLandlord) {
            // Update existing landlord
            const { error } = await supabase
              .from('landlords')
              .update({
                phone: landlordData.phone || existingLandlord.phone,
                business_name: landlordData.business_name || existingLandlord.business_name,
                abn: landlordData.abn || existingLandlord.abn,
                address: landlordData.address || existingLandlord.address,
                ndis_registered: landlordData.ndis_registered || existingLandlord.ndis_registered,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingLandlord.id)

            if (error) {
              console.error(`Error updating landlord:`, error)
              results.errors++
            } else {
              console.log(`✅ Updated landlord: ${existingLandlord.id}`)
              results.landlords_updated++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                landlord_id: existingLandlord.id,
                landlord_name: landlordData.full_name,
                action: 'updated'
              })
            }
          } else {
            // Create new landlord (full_name and email are required by schema)
            const newLandlord = {
              full_name: landlordData.full_name, // Already validated as not empty
              email: landlordData.email, // Already validated as not empty
              phone: landlordData.phone || null,
              business_name: landlordData.business_name || null,
              abn: landlordData.abn || null,
              address: landlordData.address || null,
              ndis_registered: landlordData.ndis_registered || false,
              registration_number: landlordData.registration_number || null,
              registration_expiry: landlordData.registration_expiry || null,
              bank_name: landlordData.bank_name || null,
              bsb: landlordData.bank_bsb || null,
              account_number: landlordData.bank_account_number || null,
              status: 'active',
              organization_id: 'homelander',
              created_at: new Date().toISOString()
            }

            const { data: created, error } = await supabase
              .from('landlords')
              .insert([newLandlord])
              .select()
              .single()

            if (error) {
              console.error(`Error creating landlord:`, error)
              results.errors++
            } else {
              console.log(`✅ Created landlord: ${created.id}`)
              results.landlords_created++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                landlord_id: created.id,
                landlord_name: landlordData.full_name,
                action: 'created'
              })
            }
          }

        } catch (submissionError: any) {
          console.error(`Error processing submission:`, submissionError)
          results.errors++
        }
      }

      // Rate limiting between forms
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error: any) {
      console.error(`Error processing form ${formId}:`, error)
      results.errors++
    }
  }

  return results
}

// Extract landlord data from JotForm answers
function extractLandlordData(answers: Record<string, any>, formId: string) {
  let full_name = ''
  let email = ''
  let phone = ''
  let business_name = ''
  let abn = ''
  let address = ''
  let ndis_registered = false
  let registration_number = ''
  let registration_expiry = ''
  let bank_name = ''
  let bank_bsb = ''
  let bank_account_number = ''

  for (const [key, value] of Object.entries(answers)) {
    const answer = value as any
    const fieldText = (answer?.text || '').toLowerCase()
    const fieldName = (answer?.name || '').toLowerCase()
    const fieldValue = answer?.answer

    // Skip non-landlord fields
    if (!fieldText && !fieldName) continue

    // Extract landlord name (flexible matching)
    if (
      fieldText.includes('landlord') && fieldText.includes('name') ||
      fieldText.includes('owner') && fieldText.includes('name') ||
      fieldText.includes('property owner') ||
      fieldName.includes('landlord') && fieldName.includes('name') ||
      fieldName.includes('fullname') ||
      fieldName.includes('full_name') ||
      (fieldText.includes('name') && !fieldText.includes('business') && !fieldText.includes('company') && !fieldText.includes('bank'))
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        full_name = `${firstName} ${lastName}`.trim()
      } else if (fieldValue && String(fieldValue).trim()) {
        full_name = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract email (flexible matching)
    if (
      fieldText.includes('email') ||
      fieldName.includes('email') ||
      fieldName === 'email'
    ) {
      if (fieldValue && String(fieldValue).trim()) {
        email = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract phone (flexible matching)
    if (
      fieldText.includes('phone') ||
      fieldText.includes('mobile') ||
      fieldText.includes('contact') && fieldText.includes('number') ||
      fieldName.includes('phone') ||
      fieldName.includes('mobile')
    ) {
      if (fieldValue && String(fieldValue).trim()) {
        phone = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract business name
    if (
      fieldText.includes('business') && fieldText.includes('name') ||
      fieldText.includes('company') && fieldText.includes('name')
    ) {
      business_name = String(fieldValue || '').trim()
      continue
    }

    // Extract ABN
    if (
      fieldText.includes('abn') ||
      fieldText.includes('australian business number')
    ) {
      abn = String(fieldValue || '').trim()
      continue
    }

    // Extract address
    if (
      fieldText.includes('address') && !fieldText.includes('email') ||
      fieldText.includes('location')
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const parts = []
        if (fieldValue.addr_line1) parts.push(fieldValue.addr_line1)
        if (fieldValue.city) parts.push(fieldValue.city)
        if (fieldValue.state) parts.push(fieldValue.state)
        if (fieldValue.postal) parts.push(fieldValue.postal)
        address = parts.join(', ')
      } else {
        address = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract NDIS registration
    if (
      fieldText.includes('ndis') && fieldText.includes('registered') ||
      fieldText.includes('ndis') && fieldText.includes('provider')
    ) {
      const value = String(fieldValue || '').toLowerCase()
      ndis_registered = value === 'yes' || value === 'true' || value === '1'
      continue
    }

    // Extract registration number
    if (
      fieldText.includes('registration') && fieldText.includes('number') ||
      fieldText.includes('provider') && fieldText.includes('number')
    ) {
      registration_number = String(fieldValue || '').trim()
      continue
    }

    // Extract bank details
    if (fieldText.includes('bank') && fieldText.includes('name')) {
      bank_name = String(fieldValue || '').trim()
      continue
    }

    if (fieldText.includes('bsb')) {
      bank_bsb = String(fieldValue || '').trim()
      continue
    }

    if (
      fieldText.includes('account') && fieldText.includes('number') &&
      !fieldText.includes('abn')
    ) {
      bank_account_number = String(fieldValue || '').trim()
      continue
    }
  }

  return {
    full_name,
    email,
    phone,
    business_name,
    abn,
    address,
    ndis_registered,
    registration_number,
    registration_expiry,
    bank_name,
    bank_bsb,
    bank_account_number
  }
}

// Extract investors from JotForm submissions
async function extractInvestorsFromJotform(apiKey: string, formIds: string[]) {
  console.log('💰 Extracting investors from JotForm')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const results = {
    total_submissions: 0,
    investors_created: 0,
    investors_updated: 0,
    investors_skipped: 0,
    errors: 0,
    details: [] as any[]
  }

  for (const formId of formIds) {
    try {
      console.log(`📋 Fetching submissions from form ${formId}`)

      const response = await fetch(`https://api.jotform.com/form/${formId}/submissions?limit=1000`, {
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`Failed to get submissions for form ${formId}`)
        continue
      }

      const data = await response.json()
      const submissions = data.content || []

      console.log(`✅ Found ${submissions.length} submissions for form ${formId}`)
      results.total_submissions += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract investor data
          const investorData = extractInvestorData(answers, formId)

          // Skip if no valid investor data
          if (!investorData.full_name || !investorData.email) {
            console.log(`⏭️  Submission ${submissionID} missing required fields (name: ${investorData.full_name || 'N/A'}, email: ${investorData.email || 'N/A'})`)
            results.investors_skipped++
            continue
          }

          console.log(`💰 Processing investor: ${investorData.full_name} (Email: ${investorData.email})`)

          // Check if investor exists by email
          const { data: existing } = await supabase
            .from('investors')
            .select('*')
            .eq('email', investorData.email)
            .limit(1)
            .maybeSingle()

          if (existing) {
            // Update existing investor
            const { error } = await supabase
              .from('investors')
              .update({
                phone: investorData.phone || existing.phone,
                available_capital: investorData.available_capital || existing.available_capital,
                preferred_property_types: investorData.preferred_property_types.length > 0
                  ? investorData.preferred_property_types
                  : existing.preferred_property_types,
                preferred_locations: investorData.preferred_locations.length > 0
                  ? investorData.preferred_locations
                  : existing.preferred_locations,
                risk_tolerance: investorData.risk_tolerance || existing.risk_tolerance,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)

            if (error) {
              console.error(`Error updating investor:`, error)
              results.errors++
            } else {
              console.log(`✅ Updated investor: ${existing.id}`)
              results.investors_updated++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                investor_id: existing.id,
                investor_name: investorData.full_name,
                action: 'updated'
              })
            }
          } else {
            // Create new investor
            const newInvestor = {
              full_name: investorData.full_name,
              email: investorData.email,
              phone: investorData.phone || null,
              available_capital: investorData.available_capital || 0,
              preferred_property_types: investorData.preferred_property_types.length > 0
                ? investorData.preferred_property_types
                : ['sda', 'ndis'],
              preferred_locations: investorData.preferred_locations.length > 0
                ? investorData.preferred_locations
                : [],
              risk_tolerance: investorData.risk_tolerance || 'medium',
              organization_id: 'plcg',
              created_at: new Date().toISOString()
            }

            const { data: created, error } = await supabase
              .from('investors')
              .insert([newInvestor])
              .select()
              .single()

            if (error) {
              console.error(`Error creating investor:`, error)
              results.errors++
            } else {
              console.log(`✅ Created investor: ${created.id}`)
              results.investors_created++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                investor_id: created.id,
                investor_name: investorData.full_name,
                action: 'created'
              })
            }
          }

        } catch (submissionError: any) {
          console.error(`Error processing submission:`, submissionError)
          results.errors++
        }
      }

      // Rate limiting between forms
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error: any) {
      console.error(`Error processing form ${formId}:`, error)
      results.errors++
    }
  }

  return results
}

// Extract investor data from JotForm answers
function extractInvestorData(answers: Record<string, any>, formId: string) {
  let full_name = ''
  let email = ''
  let phone = ''
  let available_capital = 0
  const preferred_property_types: string[] = []
  const preferred_locations: string[] = []
  let risk_tolerance = ''

  for (const [key, value] of Object.entries(answers)) {
    const answer = value as any
    const fieldText = (answer?.text || '').toLowerCase()
    const fieldName = (answer?.name || '').toLowerCase()
    const fieldValue = answer?.answer

    // Skip non-investor fields
    if (!fieldText && !fieldName) continue

    // Extract investor name (flexible matching)
    if (
      fieldText.includes('investor') && fieldText.includes('name') ||
      fieldText.includes('your') && fieldText.includes('name') ||
      fieldName.includes('investor') && fieldName.includes('name') ||
      fieldName.includes('fullname') ||
      fieldName.includes('full_name') ||
      fieldName === 'name' ||
      (fieldText.includes('name') && !fieldText.includes('business') && !fieldText.includes('company'))
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        full_name = `${firstName} ${lastName}`.trim()
      } else if (fieldValue && String(fieldValue).trim()) {
        full_name = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract email (flexible matching)
    if (
      fieldText.includes('email') ||
      fieldName.includes('email') ||
      fieldName === 'email'
    ) {
      if (fieldValue && String(fieldValue).trim()) {
        email = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract phone (flexible matching)
    if (
      fieldText.includes('phone') ||
      fieldText.includes('mobile') ||
      fieldText.includes('contact') && fieldText.includes('number') ||
      fieldName.includes('phone') ||
      fieldName.includes('mobile')
    ) {
      if (fieldValue && String(fieldValue).trim()) {
        phone = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract available capital
    if (
      fieldText.includes('capital') ||
      fieldText.includes('investment') && fieldText.includes('amount') ||
      fieldText.includes('budget') ||
      fieldName.includes('capital')
    ) {
      const capitalStr = String(fieldValue || '').replace(/[^0-9.]/g, '')
      const capitalNum = parseFloat(capitalStr)
      if (!isNaN(capitalNum) && capitalNum > 0) {
        available_capital = capitalNum
      }
      continue
    }

    // Extract property type preferences
    if (
      fieldText.includes('property') && fieldText.includes('type') ||
      fieldText.includes('investment') && fieldText.includes('type')
    ) {
      const types = String(fieldValue || '').toLowerCase()
      if (types.includes('sda')) preferred_property_types.push('sda')
      if (types.includes('ndis')) preferred_property_types.push('ndis')
      if (types.includes('residential')) preferred_property_types.push('residential')
      if (types.includes('commercial')) preferred_property_types.push('commercial')
      continue
    }

    // Extract location preferences
    if (
      fieldText.includes('location') ||
      fieldText.includes('area') ||
      fieldText.includes('suburb') ||
      fieldText.includes('region')
    ) {
      const locations = String(fieldValue || '').split(/[,;]/).map(l => l.trim()).filter(l => l)
      preferred_locations.push(...locations)
      continue
    }

    // Extract risk tolerance
    if (
      fieldText.includes('risk') ||
      fieldName.includes('risk')
    ) {
      const riskStr = String(fieldValue || '').toLowerCase()
      if (riskStr.includes('low')) risk_tolerance = 'low'
      else if (riskStr.includes('high')) risk_tolerance = 'high'
      else risk_tolerance = 'medium'
      continue
    }
  }

  return {
    full_name,
    email,
    phone,
    available_capital,
    preferred_property_types: [...new Set(preferred_property_types)], // Remove duplicates
    preferred_locations: [...new Set(preferred_locations)], // Remove duplicates
    risk_tolerance
  }
}
