// Audit Supabase Data - Get counts and sample records from all tables
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bqvptfdxnrzculgjcnjo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjY5NDAsImV4cCI6MjA2OTgwMjk0MH0.I10e1TQkVntpEm3KSXmydNJQLbhJQ3MU4SyMt1lOvOk'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const tables = [
  'participants',
  'properties',
  'landlords',
  'investors',
  'jobs',
  'job_investors',
  'file_uploads',
  'document_extractions',
  'ai_actions',
  'ai_recommendations',
  'organizations',
  'admin_users'
]

async function auditTable(tableName: string) {
  try {
    // Get count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log(`❌ ${tableName}: Error - ${countError.message}`)
      return { table: tableName, count: 0, error: countError.message }
    }

    // Get sample record
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (sampleError) {
      console.log(`⚠️  ${tableName}: Count ${count}, but couldn't fetch sample`)
      return { table: tableName, count, sample: null }
    }

    console.log(`✅ ${tableName}: ${count} records`)
    return { table: tableName, count, sample: sampleData?.[0] || null }

  } catch (error) {
    console.log(`❌ ${tableName}: Exception - ${error.message}`)
    return { table: tableName, count: 0, error: error.message }
  }
}

async function main() {
  console.log('🔍 Auditing Supabase Database...\n')
  console.log('Database:', SUPABASE_URL)
  console.log('Timestamp:', new Date().toISOString())
  console.log('─'.repeat(50) + '\n')

  const results = []

  for (const table of tables) {
    const result = await auditTable(table)
    results.push(result)
  }

  console.log('\n' + '─'.repeat(50))
  console.log('📊 SUMMARY\n')

  const totalRecords = results.reduce((sum, r) => sum + (r.count || 0), 0)
  console.log(`Total records across all tables: ${totalRecords}`)

  console.log('\n📋 Table Breakdown:')
  results.forEach(r => {
    const status = r.error ? '❌' : r.count > 0 ? '✅' : '⚪'
    console.log(`  ${status} ${r.table.padEnd(25)} ${r.count || 0} records`)
  })

  console.log('\n📄 Sample Data:')
  results
    .filter(r => r.count > 0 && r.sample)
    .slice(0, 3)
    .forEach(r => {
      console.log(`\n${r.table}:`)
      console.log(JSON.stringify(r.sample, null, 2).split('\n').slice(0, 10).join('\n'))
      console.log('  ...')
    })

  console.log('\n✅ Audit complete!')

  // Return results for programmatic use
  return results
}

if (import.meta.main) {
  await main()
}
