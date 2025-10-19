import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NDIAProcessorRequest {
  action: 'generate_batch' | 'create_csv' | 'submit_batch' | 'reconcile_batch' | 'auto_process_monthly'
  batch_id?: string
  period_start?: string
  period_end?: string
  organization_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('💰 NDIA Payment Processor - Processing request')

    const requestData: NDIAProcessorRequest = await req.json()
    const action = requestData.action

    console.log(`🎯 Action: ${action}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let result

    switch (action) {
      case 'generate_batch':
        result = await generatePaymentBatch(supabase, requestData)
        break

      case 'create_csv':
        result = await createNDIACSV(supabase, requestData.batch_id!)
        break

      case 'submit_batch':
        result = await submitBatchToNDIA(supabase, requestData.batch_id!)
        break

      case 'reconcile_batch':
        result = await reconcileBatch(supabase, requestData.batch_id!)
        break

      case 'auto_process_monthly':
        result = await autoProcessMonthlyPayments(supabase, requestData.organization_id!)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Generate payment batch for a period
async function generatePaymentBatch(supabase: any, requestData: NDIAProcessorRequest) {
  console.log('📋 Generating payment batch')

  const periodStart = new Date(requestData.period_start!)
  const periodEnd = new Date(requestData.period_end!)
  const organizationId = requestData.organization_id || 'homelander'

  // Generate batch number
  const batchNumber = await generateBatchNumber(supabase)

  // Get all active tenancies for the period
  const { data: tenancies, error: tenancyError } = await supabase
    .from('tenancies')
    .select(`
      *,
      property:properties(*),
      participant:participants(*),
      landlord:landlords(*)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .lte('lease_start_date', periodEnd.toISOString().split('T')[0])
    .or(`lease_end_date.is.null,lease_end_date.gte.${periodStart.toISOString().split('T')[0]}`)

  if (tenancyError) throw tenancyError

  console.log(`✅ Found ${tenancies?.length || 0} active tenancies`)

  // Create batch record
  const { data: batch, error: batchError } = await supabase
    .from('ndia_payment_batches')
    .insert({
      organization_id: organizationId,
      batch_number: batchNumber,
      batch_date: new Date().toISOString().split('T')[0],
      payment_period_start: periodStart.toISOString().split('T')[0],
      payment_period_end: periodEnd.toISOString().split('T')[0],
      status: 'draft',
      total_properties: tenancies?.length || 0,
      total_participants: new Set(tenancies?.map((t: any) => t.participant_id)).size || 0
    })
    .select()
    .single()

  if (batchError) throw batchError

  console.log(`✅ Created batch: ${batch.id}`)

  // Create rental payment records
  const paymentRecords = []
  let totalAmount = 0

  for (const tenancy of tenancies || []) {
    const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    const weeksInPeriod = daysInPeriod / 7
    const rentAmount = parseFloat(tenancy.weekly_rent) * weeksInPeriod
    const sdaPaymentAmount = tenancy.sda_rate_per_day ? parseFloat(tenancy.sda_rate_per_day) * daysInPeriod : 0
    const totalPayment = rentAmount + sdaPaymentAmount

    totalAmount += totalPayment

    paymentRecords.push({
      organization_id: organizationId,
      tenancy_id: tenancy.id,
      property_id: tenancy.property_id,
      participant_id: tenancy.participant_id,
      landlord_id: tenancy.landlord_id,
      payment_period_start: periodStart.toISOString().split('T')[0],
      payment_period_end: periodEnd.toISOString().split('T')[0],
      due_date: new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days after period end
      rent_amount: rentAmount,
      sda_payment_amount: sdaPaymentAmount,
      total_amount: totalPayment,
      status: 'pending',
      payment_method: 'ndia_direct',
      ndia_batch_id: batch.id
    })
  }

  if (paymentRecords.length > 0) {
    const { error: paymentsError } = await supabase
      .from('rental_payments')
      .insert(paymentRecords)

    if (paymentsError) throw paymentsError

    // Update batch with total amount
    await supabase
      .from('ndia_payment_batches')
      .update({ total_amount: totalAmount })
      .eq('id', batch.id)
  }

  console.log(`✅ Created ${paymentRecords.length} payment records totaling $${totalAmount.toFixed(2)}`)

  return {
    batch_id: batch.id,
    batch_number: batchNumber,
    total_tenancies: tenancies?.length || 0,
    total_payments: paymentRecords.length,
    total_amount: totalAmount,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0]
  }
}

// Create NDIA CSV export
async function createNDIACSV(supabase: any, batchId: string) {
  console.log(`📄 Creating CSV for batch: ${batchId}`)

  // Get batch details
  const { data: batch, error: batchError } = await supabase
    .from('ndia_payment_batches')
    .select('*')
    .eq('id', batchId)
    .single()

  if (batchError) throw batchError

  // Get all payments in batch
  const { data: payments, error: paymentsError } = await supabase
    .from('rental_payments')
    .select(`
      *,
      tenancy:tenancies(*),
      participant:participants(*),
      property:properties(*),
      landlord:landlords(*)
    `)
    .eq('ndia_batch_id', batchId)
    .order('participant_id')

  if (paymentsError) throw paymentsError

  console.log(`✅ Found ${payments?.length || 0} payments to export`)

  // Generate CSV content
  const csvHeaders = [
    'Batch Number',
    'Payment Period Start',
    'Payment Period End',
    'Participant Name',
    'NDIS Number',
    'Plan Number',
    'Property Address',
    'SDA Category',
    'Rental Amount',
    'SDA Payment Amount',
    'Total Amount',
    'Landlord Name',
    'Landlord ABN',
    'Payment Reference'
  ]

  const csvRows = [csvHeaders.join(',')]

  for (const payment of payments || []) {
    const row = [
      batch.batch_number,
      batch.payment_period_start,
      batch.payment_period_end,
      `"${payment.participant?.name || 'Unknown'}"`,
      payment.participant?.ndis_number || '',
      payment.tenancy?.ndis_plan_number || '',
      `"${payment.property?.address || ''}, ${payment.property?.suburb || ''}, ${payment.property?.state || ''} ${payment.property?.postcode || ''}"`,
      payment.tenancy?.sda_category || '',
      payment.rent_amount?.toFixed(2) || '0.00',
      payment.sda_payment_amount?.toFixed(2) || '0.00',
      payment.total_amount?.toFixed(2) || '0.00',
      `"${payment.landlord?.full_name || 'Unknown'}"`,
      payment.landlord?.abn || '',
      `REF-${payment.id.substring(0, 8)}`
    ]

    csvRows.push(row.join(','))
  }

  const csvContent = csvRows.join('\n')

  // Save CSV to storage
  const fileName = `${batch.batch_number}_${new Date().toISOString().split('T')[0]}.csv`
  const storagePath = `ndia-batches/${batch.batch_number}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, csvContent, {
      contentType: 'text/csv',
      upsert: true
    })

  if (uploadError) throw uploadError

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  // Update batch with CSV details
  await supabase
    .from('ndia_payment_batches')
    .update({
      csv_file_url: urlData.publicUrl,
      csv_generated_at: new Date().toISOString(),
      status: 'ready'
    })
    .eq('id', batchId)

  console.log(`✅ CSV generated: ${storagePath}`)

  return {
    batch_id: batchId,
    batch_number: batch.batch_number,
    csv_url: urlData.publicUrl,
    file_name: fileName,
    payment_count: payments?.length || 0,
    total_amount: batch.total_amount
  }
}

// Submit batch to NDIA (marks as submitted)
async function submitBatchToNDIA(supabase: any, batchId: string) {
  console.log(`📤 Submitting batch to NDIA: ${batchId}`)

  const { data: batch, error: batchError } = await supabase
    .from('ndia_payment_batches')
    .update({
      status: 'submitted',
      submission_date: new Date().toISOString().split('T')[0],
      submission_method: 'csv_upload'
    })
    .eq('id', batchId)
    .select()
    .single()

  if (batchError) throw batchError

  // Update all payments in batch
  await supabase
    .from('rental_payments')
    .update({
      status: 'processing',
      submitted_to_ndia: true,
      ndia_submission_date: new Date().toISOString().split('T')[0]
    })
    .eq('ndia_batch_id', batchId)

  console.log(`✅ Batch submitted: ${batch.batch_number}`)

  return {
    batch_id: batchId,
    batch_number: batch.batch_number,
    submission_date: batch.submission_date,
    status: batch.status
  }
}

// Reconcile batch (mark payments as paid)
async function reconcileBatch(supabase: any, batchId: string) {
  console.log(`✅ Reconciling batch: ${batchId}`)

  const { data: batch, error: batchError } = await supabase
    .from('ndia_payment_batches')
    .update({
      status: 'paid',
      reconciled: true,
      reconciled_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', batchId)
    .select()
    .single()

  if (batchError) throw batchError

  // Update all payments in batch as paid
  await supabase
    .from('rental_payments')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      ndia_approved: true,
      ndia_approval_date: new Date().toISOString().split('T')[0],
      reconciled: true,
      reconciled_date: new Date().toISOString().split('T')[0]
    })
    .eq('ndia_batch_id', batchId)

  console.log(`✅ Batch reconciled: ${batch.batch_number}`)

  return {
    batch_id: batchId,
    batch_number: batch.batch_number,
    status: 'paid',
    reconciled: true
  }
}

// Auto-process monthly payments (called by cron)
async function autoProcessMonthlyPayments(supabase: any, organizationId: string) {
  console.log('🤖 Auto-processing monthly payments')

  // Calculate last month's period
  const today = new Date()
  const periodEnd = new Date(today.getFullYear(), today.getMonth(), 0) // Last day of previous month
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1) // First day of previous month

  console.log(`📅 Processing period: ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`)

  // Check if batch already exists for this period
  const { data: existingBatch } = await supabase
    .from('ndia_payment_batches')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('payment_period_start', periodStart.toISOString().split('T')[0])
    .eq('payment_period_end', periodEnd.toISOString().split('T')[0])
    .single()

  if (existingBatch) {
    console.log(`⚠️ Batch already exists: ${existingBatch.batch_number}`)
    return {
      status: 'already_exists',
      batch_id: existingBatch.id,
      batch_number: existingBatch.batch_number
    }
  }

  // Generate new batch
  const batchResult = await generatePaymentBatch(supabase, {
    action: 'generate_batch',
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    organization_id: organizationId
  })

  // Generate CSV automatically
  const csvResult = await createNDIACSV(supabase, batchResult.batch_id)

  console.log(`✅ Auto-processed monthly payments for ${organizationId}`)

  return {
    status: 'created',
    batch: batchResult,
    csv: csvResult
  }
}

// Helper: Generate batch number
async function generateBatchNumber(supabase: any): Promise<string> {
  const yearMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

  const { data: batches } = await supabase
    .from('ndia_payment_batches')
    .select('batch_number')
    .ilike('batch_number', `BATCH-${yearMonth}-%`)
    .order('batch_number', { ascending: false })
    .limit(1)

  let seqNum = 1

  if (batches && batches.length > 0) {
    const lastBatch = batches[0].batch_number
    const match = lastBatch.match(/BATCH-\d{4}-\d{2}-(\d+)/)
    if (match) {
      seqNum = parseInt(match[1]) + 1
    }
  }

  return `BATCH-${yearMonth}-${seqNum.toString().padStart(3, '0')}`
}
