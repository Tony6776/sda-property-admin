/**
 * SDA Data Audit Script
 *
 * Purpose: Analyze current data quality and tag records by type
 * Run this to understand what you really have before migration
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqvptfdxnrzculgjcnjo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface AuditResult {
  total_properties: number;
  by_organization: Record<string, number>;
  by_audience: Record<string, number>;
  by_status: Record<string, number>;
  by_visibility: {
    participant_site: number;
    investor_site: number;
    both_sites: number;
    neither_site: number;
  };
  data_quality: {
    complete_profiles: number;
    missing_images: number;
    missing_organization: number;
    missing_audience: number;
  };
}

async function auditProperties(): Promise<AuditResult> {
  console.log('🔍 Starting property audit...\n');

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*');

  if (error) {
    console.error('❌ Error fetching properties:', error);
    process.exit(1);
  }

  if (!properties || properties.length === 0) {
    console.log('⚠️  No properties found in database');
    return {
      total_properties: 0,
      by_organization: {},
      by_audience: {},
      by_status: {},
      by_visibility: {
        participant_site: 0,
        investor_site: 0,
        both_sites: 0,
        neither_site: 0,
      },
      data_quality: {
        complete_profiles: 0,
        missing_images: 0,
        missing_organization: 0,
        missing_audience: 0,
      },
    };
  }

  const result: AuditResult = {
    total_properties: properties.length,
    by_organization: {},
    by_audience: {},
    by_status: {},
    by_visibility: {
      participant_site: 0,
      investor_site: 0,
      both_sites: 0,
      neither_site: 0,
    },
    data_quality: {
      complete_profiles: 0,
      missing_images: 0,
      missing_organization: 0,
      missing_audience: 0,
    },
  };

  // Analyze each property
  properties.forEach((property: any) => {
    // Organization breakdown
    const org = property.organization_id || 'unknown';
    result.by_organization[org] = (result.by_organization[org] || 0) + 1;

    // Audience breakdown
    const audience = property.audience || 'unknown';
    result.by_audience[audience] = (result.by_audience[audience] || 0) + 1;

    // Status breakdown
    const status = property.status || 'unknown';
    result.by_status[status] = (result.by_status[status] || 0) + 1;

    // Visibility breakdown
    const onParticipantSite = property.visible_on_participant_site;
    const onInvestorSite = property.visible_on_investor_site;

    if (onParticipantSite && onInvestorSite) {
      result.by_visibility.both_sites++;
    } else if (onParticipantSite) {
      result.by_visibility.participant_site++;
    } else if (onInvestorSite) {
      result.by_visibility.investor_site++;
    } else {
      result.by_visibility.neither_site++;
    }

    // Data quality checks
    if (!property.organization_id) result.data_quality.missing_organization++;
    if (!property.audience) result.data_quality.missing_audience++;

    const images = property.accessibility?.images || [];
    if (images.length === 0) result.data_quality.missing_images++;

    // Complete profile check
    const isComplete =
      property.name &&
      property.address &&
      property.organization_id &&
      property.audience &&
      property.bedrooms &&
      property.bathrooms &&
      images.length > 0;

    if (isComplete) result.data_quality.complete_profiles++;
  });

  return result;
}

function printAuditReport(result: AuditResult) {
  console.log('═══════════════════════════════════════');
  console.log('📊 SDA PROPERTY DATA AUDIT REPORT');
  console.log('═══════════════════════════════════════\n');

  console.log(`📦 TOTAL PROPERTIES: ${result.total_properties}\n`);

  console.log('🏢 BY ORGANIZATION:');
  Object.entries(result.by_organization)
    .sort(([, a], [, b]) => b - a)
    .forEach(([org, count]) => {
      const percentage = ((count / result.total_properties) * 100).toFixed(1);
      console.log(`  ${org.padEnd(20)} ${count.toString().padStart(3)} (${percentage}%)`);
    });
  console.log();

  console.log('👥 BY AUDIENCE:');
  Object.entries(result.by_audience)
    .sort(([, a], [, b]) => b - a)
    .forEach(([audience, count]) => {
      const percentage = ((count / result.total_properties) * 100).toFixed(1);
      console.log(`  ${audience.padEnd(20)} ${count.toString().padStart(3)} (${percentage}%)`);
    });
  console.log();

  console.log('📊 BY STATUS:');
  Object.entries(result.by_status)
    .sort(([, a], [, b]) => b - a)
    .forEach(([status, count]) => {
      const percentage = ((count / result.total_properties) * 100).toFixed(1);
      console.log(`  ${status.padEnd(20)} ${count.toString().padStart(3)} (${percentage}%)`);
    });
  console.log();

  console.log('🌐 WEBSITE VISIBILITY:');
  console.log(`  Participant site only  ${result.by_visibility.participant_site.toString().padStart(3)}`);
  console.log(`  Investor site only     ${result.by_visibility.investor_site.toString().padStart(3)}`);
  console.log(`  Both sites             ${result.by_visibility.both_sites.toString().padStart(3)}`);
  console.log(`  Neither site (hidden)  ${result.by_visibility.neither_site.toString().padStart(3)}`);
  console.log();

  console.log('✅ DATA QUALITY:');
  const completePercentage = ((result.data_quality.complete_profiles / result.total_properties) * 100).toFixed(1);
  console.log(`  Complete profiles      ${result.data_quality.complete_profiles.toString().padStart(3)} (${completePercentage}%)`);
  console.log(`  Missing images         ${result.data_quality.missing_images.toString().padStart(3)}`);
  console.log(`  Missing organization   ${result.data_quality.missing_organization.toString().padStart(3)}`);
  console.log(`  Missing audience       ${result.data_quality.missing_audience.toString().padStart(3)}`);
  console.log();

  console.log('═══════════════════════════════════════');

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:\n');

  if (result.data_quality.missing_organization > 0) {
    console.log(`  ⚠️  ${result.data_quality.missing_organization} properties missing organization - assign to Homelander as default`);
  }

  if (result.data_quality.missing_audience > 0) {
    console.log(`  ⚠️  ${result.data_quality.missing_audience} properties missing audience - analyze and tag`);
  }

  if (result.data_quality.missing_images > 0) {
    console.log(`  ⚠️  ${result.data_quality.missing_images} properties missing images - request from property managers`);
  }

  if (result.by_visibility.neither_site > 0) {
    console.log(`  ⚠️  ${result.by_visibility.neither_site} properties hidden from both sites - review visibility settings`);
  }

  const dataQualityScore = (result.data_quality.complete_profiles / result.total_properties) * 100;

  console.log(`\n📈 DATA QUALITY SCORE: ${dataQualityScore.toFixed(1)}%`);

  if (dataQualityScore < 50) {
    console.log('   Status: 🔴 CRITICAL - Immediate cleanup required');
  } else if (dataQualityScore < 80) {
    console.log('   Status: 🟡 NEEDS IMPROVEMENT - Schedule cleanup');
  } else {
    console.log('   Status: 🟢 GOOD - Minor cleanup needed');
  }

  console.log('\n═══════════════════════════════════════\n');
}

// Main execution
async function main() {
  try {
    const result = await auditProperties();
    printAuditReport(result);

    // Save audit results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const auditFile = `audit-results-${timestamp}.json`;

    fs.writeFileSync(auditFile, JSON.stringify(result, null, 2));
    console.log(`📁 Audit results saved to: ${auditFile}\n`);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
