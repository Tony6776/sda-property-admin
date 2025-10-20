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
    total_processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [] as any[],
    message: ''
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
      results.total_processed += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract landlord data
          const landlordData = extractLandlordData(answers, formId)

          // Skip if no valid landlord data
          if (!landlordData.full_name && !landlordData.email) {
            console.log(`⏭️  Submission ${submissionID} has no landlord data`)
            results.skipped++
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
              results.updated++
              results.details.push({
                submission_id: submissionID,
                form_id: formId,
                landlord_id: existingLandlord.id,
                landlord_name: landlordData.full_name,
                action: 'updated'
              })
            }
          } else {
            // Create new landlord
            const newLandlord = {
              full_name: landlordData.full_name || 'Unknown',
              email: landlordData.email || null,
              phone: landlordData.phone || null,
              business_name: landlordData.business_name || null,
              abn: landlordData.abn || null,
              address: landlordData.address || null,
              ndis_registered: landlordData.ndis_registered || false,
              registration_number: landlordData.registration_number || null,
              registration_expiry: landlordData.registration_expiry || null,
              bank_name: landlordData.bank_name || null,
              bank_bsb: landlordData.bank_bsb || null,
              bank_account_number: landlordData.bank_account_number || null,
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
              results.inserted++
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

  results.message = `Landlord extraction completed: ${results.inserted} created, ${results.updated} updated, ${results.skipped} skipped from ${results.total_processed} submissions`
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

    // Extract landlord name - UPDATED with actual field names
    if (
      fieldName === 'landlorddirectorname' ||       // Landlord/Director Name
      fieldName === 'individualor' ||               // Individual or Company Representative Name
      fieldText.includes('landlord') && fieldText.includes('name') ||
      fieldText.includes('owner') && fieldText.includes('name') ||
      fieldText.includes('director') && fieldText.includes('name') ||
      fieldText.includes('representative') && fieldText.includes('name')
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        full_name = `${firstName} ${lastName}`.trim()
      } else {
        full_name = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract email
    if (
      fieldText.includes('landlord') && fieldText.includes('email') ||
      fieldText.includes('owner') && fieldText.includes('email') ||
      fieldName.includes('landlord') && fieldName.includes('email')
    ) {
      email = String(fieldValue || '').trim()
      continue
    }

    // Extract phone - UPDATED
    if (
      fieldName === 'phonenumber' ||
      fieldText.includes('phone') ||
      fieldText.includes('mobile') ||
      fieldText.includes('contact') && fieldText.includes('number')
    ) {
      phone = String(fieldValue || '').trim()
      continue
    }

    // Extract business name - UPDATED
    if (
      fieldName === 'companydetails' ||                    // Company Details (if required)
      fieldText.includes('company') && fieldText.includes('details') ||
      fieldText.includes('business') && fieldText.includes('name') ||
      fieldText.includes('company') && fieldText.includes('name')
    ) {
      business_name = String(fieldValue || '').trim()
      continue
    }

    // Extract ABN - UPDATED
    if (
      fieldName === 'abnacnif' ||                          // ABN/ACN (if required)
      fieldText.includes('abn') ||
      fieldText.includes('acn') ||
      fieldText.includes('australian business number')
    ) {
      abn = String(fieldValue || '').trim()
      continue
    }

    // Extract address - UPDATED
    if (
      fieldName === 'addresscompany' ||                    // Address (Company or Individual)
      fieldName === 'sdaproperty' ||                       // SDA Property Address
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
    total_processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [] as any[],
    message: ''
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
      results.total_processed += submissions.length

      // Process each submission
      for (const submission of submissions) {
        try {
          const submissionID = submission.id
          const answers = submission.answers || {}

          // Extract investor data
          const investorData = extractInvestorData(answers, formId)

          // Skip if no valid investor data
          if (!investorData.full_name || !investorData.email) {
            console.log(`⏭️  Submission ${submissionID} has no investor data`)
            results.skipped++
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
              results.updated++
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
              results.inserted++
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

  results.message = `Investor extraction completed: ${results.inserted} created, ${results.updated} updated, ${results.skipped} skipped from ${results.total_processed} submissions`
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

    // Extract investor name
    if (
      fieldText.includes('investor') && fieldText.includes('name') ||
      fieldText.includes('your') && fieldText.includes('name') ||
      fieldName.includes('investor') && fieldName.includes('name') ||
      fieldName === 'name' || fieldName === 'fullname'
    ) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const firstName = fieldValue.first || ''
        const lastName = fieldValue.last || ''
        full_name = `${firstName} ${lastName}`.trim()
      } else {
        full_name = String(fieldValue || '').trim()
      }
      continue
    }

    // Extract email
    if (
      fieldText.includes('email') ||
      fieldName.includes('email')
    ) {
      email = String(fieldValue || '').trim()
      continue
    }

    // Extract phone
    if (
      fieldText.includes('phone') ||
      fieldText.includes('mobile') ||
      fieldName.includes('phone')
    ) {
      phone = String(fieldValue || '').trim()
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
