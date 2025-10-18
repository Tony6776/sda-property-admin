/**
 * Edge Functions Service - Nucleus Backend Integration
 *
 * Provides unified access to all Supabase Edge Functions
 * Routes all business logic through centralized backend
 */

const SUPABASE_URL = "https://bqvptfdxnrzculgjcnjo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIyNjk0MCwiZXhwIjoyMDY5ODAyOTQwfQ.3s8fFVrDyJmMwbpo9OXx03GyV5JT3M8sVEUAV8_qhh4";

interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Call any Edge Function with authentication
 */
async function callEdgeFunction<T = any>(
  functionName: string,
  payload?: any,
  action?: string
): Promise<EdgeFunctionResponse<T>> {
  try {
    const url = action
      ? `${SUPABASE_URL}/functions/v1/${functionName}?action=${action}`
      : `${SUPABASE_URL}/functions/v1/${functionName}`;

    const response = await fetch(url, {
      method: payload ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Edge Function ${functionName} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ultra-Intelligent Lead Routing
 * AI-powered semantic lead distribution with GHL integration
 */
export async function routeLead(lead: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  category?: 'participant' | 'investor' | 'landlord' | 'general';
  source?: string;
  metadata?: Record<string, any>;
}) {
  return callEdgeFunction('ultra-intelligent-lead-routing', {
    lead: {
      ...lead,
      submittedAt: new Date().toISOString(),
      source: lead.source || 'website',
    }
  });
}

/**
 * Process Eligibility Assessment
 * Routes through lead routing + triggers property matching
 */
export async function processEligibilityAssessment(assessment: {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hasNDISPlan: string;
  hasSDAfunding: string;
  currentHousing: string;
  supportNeeds: string;
  ageGroup: string;
  location: string;
  householdIncome: string;
  preferredPathway: string;
  timeframe: string;
  additionalInfo: string;
  eligibilityScore?: number;
  eligibilityStatus?: string;
}) {
  // First, route the lead
  const leadResult = await routeLead({
    name: assessment.contactName,
    email: assessment.contactEmail,
    phone: assessment.contactPhone,
    category: 'participant',
    source: 'eligibility-assessment',
    metadata: {
      hasNDISPlan: assessment.hasNDISPlan,
      hasSDAfunding: assessment.hasSDAfunding,
      location: assessment.location,
      preferredPathway: assessment.preferredPathway,
      eligibilityScore: assessment.eligibilityScore,
      eligibilityStatus: assessment.eligibilityStatus,
    }
  });

  // Then trigger property matching if eligible
  if (assessment.eligibilityScore && assessment.eligibilityScore >= 70) {
    await matchProperties({
      participantEmail: assessment.contactEmail,
      location: assessment.location,
      supportNeeds: assessment.supportNeeds,
      preferredPathway: assessment.preferredPathway,
      householdIncome: assessment.householdIncome,
    });
  }

  return leadResult;
}

/**
 * Continuous Property Matching
 * Match properties to participants based on criteria
 */
export async function matchProperties(criteria: {
  participantEmail: string;
  location?: string;
  supportNeeds?: string;
  preferredPathway?: string;
  householdIncome?: string;
}) {
  return callEdgeFunction('continuous-property-matching', {
    participant: criteria,
    threshold: 70,
  });
}

/**
 * Search Active SDA Properties
 * Daily DCF-viable property search
 */
export async function searchProperties(filters?: {
  location?: string;
  priceRange?: { min: number; max: number };
  bedrooms?: number;
  category?: string;
}) {
  return callEdgeFunction('active-sda-property-finder', {
    filters: filters || {},
  });
}

/**
 * Sync Data to Airtable
 * JotForm → Airtable CRM integration
 */
export async function syncToAirtable(data: {
  type: 'contact' | 'lead' | 'property' | 'participant';
  record: Record<string, any>;
}) {
  return callEdgeFunction('jotform-airtable-integration', data);
}

/**
 * Get Business Intelligence Report
 * AI-organized Airtable data analysis
 */
export async function getBusinessIntelligence() {
  return callEdgeFunction('ai-business-intelligence-organizer', null, 'health');
}

/**
 * Master Orchestrator Actions
 * Coordinated multi-function operations
 */
export async function orchestrate(action: 'daily-morning' | 'lead-processing' | 'property-pipeline' | 'bi-report') {
  return callEdgeFunction('master-mcp-orchestrator', null, action);
}

/**
 * Complete Data Pipeline
 * Full data sync and organization
 */
export async function runDataPipeline() {
  return callEdgeFunction('complete-data-pipeline');
}

/**
 * Advanced Airtable BI
 * Deep analytics and insights
 */
export async function getAdvancedAnalytics() {
  return callEdgeFunction('advanced-airtable-bi');
}

/**
 * Health Check - Test all functions
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  functions: Record<string, boolean>;
}> {
  const functions = [
    'ultra-intelligent-lead-routing',
    'continuous-property-matching',
    'active-sda-property-finder',
    'jotform-airtable-integration',
    'ai-business-intelligence-organizer',
  ];

  const results: Record<string, boolean> = {};

  for (const fn of functions) {
    const response = await callEdgeFunction(fn, null, 'health');
    results[fn] = response.success;
  }

  const healthyCount = Object.values(results).filter(Boolean).length;
  const status =
    healthyCount === functions.length ? 'healthy' :
    healthyCount >= functions.length * 0.5 ? 'degraded' :
    'unhealthy';

  return { status, functions: results };
}

export default {
  routeLead,
  processEligibilityAssessment,
  matchProperties,
  searchProperties,
  syncToAirtable,
  getBusinessIntelligence,
  orchestrate,
  runDataPipeline,
  getAdvancedAnalytics,
  healthCheck,
};
