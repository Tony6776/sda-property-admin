/**
 * AI Property Matching Algorithm
 *
 * This edge function calculates match scores between participants and properties
 * based on multiple factors: location, budget, accessibility, SDA category, etc.
 *
 * Triggered by:
 * - New participant registration
 * - Participant profile update
 * - New property added
 * - Manual trigger from admin
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchReason {
  reason: string;
  score: number;
  details?: string;
}

interface PropertyMatch {
  property_id: string;
  participant_id: string;
  match_score: number;
  match_reasons: MatchReason[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { participant_id, property_id } = await req.json();

    // If specific participant provided, match only for that participant
    // Otherwise, match all participants against all properties
    const matches: PropertyMatch[] = [];

    if (participant_id) {
      const participantMatches = await matchParticipantToProperties(supabaseClient, participant_id);
      matches.push(...participantMatches);
    } else if (property_id) {
      const propertyMatches = await matchPropertyToParticipants(supabaseClient, property_id);
      matches.push(...propertyMatches);
    } else {
      // Match all participants to all properties (batch job)
      const allMatches = await matchAllParticipantsToProperties(supabaseClient);
      matches.push(...allMatches);
    }

    // Save matches to database (upsert to avoid duplicates)
    if (matches.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('property_matches')
        .upsert(
          matches.map(m => ({
            property_id: m.property_id,
            participant_id: m.participant_id,
            match_score: m.match_score,
            match_reasons: m.match_reasons,
            status: 'suggested', // default status for new matches
            updated_at: new Date().toISOString(),
          })),
          {
            onConflict: 'property_id,participant_id',
            ignoreDuplicates: false // update existing matches
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      // Send notifications for high-quality matches (score >= 80)
      const excellentMatches = matches.filter(m => m.match_score >= 80);
      if (excellentMatches.length > 0) {
        await sendMatchNotifications(supabaseClient, excellentMatches);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches_calculated: matches.length,
        excellent_matches: matches.filter(m => m.match_score >= 80).length,
        good_matches: matches.filter(m => m.match_score >= 60 && m.match_score < 80).length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error calculating matches:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function matchParticipantToProperties(
  supabaseClient: any,
  participantId: string
): Promise<PropertyMatch[]> {
  // Fetch participant
  const { data: participant, error: participantError } = await supabaseClient
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single();

  if (participantError || !participant) {
    throw new Error(`Participant not found: ${participantId}`);
  }

  // Fetch available properties
  const { data: properties, error: propertiesError } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('visible_on_participant_site', true);

  if (propertiesError) throw propertiesError;

  const matches: PropertyMatch[] = [];

  for (const property of properties || []) {
    const match = calculateMatchScore(participant, property);
    if (match.match_score >= 40) { // Only store matches with score >= 40
      matches.push(match);
    }
  }

  return matches;
}

async function matchPropertyToParticipants(
  supabaseClient: any,
  propertyId: string
): Promise<PropertyMatch[]> {
  // Fetch property
  const { data: property, error: propertyError } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error(`Property not found: ${propertyId}`);
  }

  // Fetch active participants
  const { data: participants, error: participantsError } = await supabaseClient
    .from('participants')
    .select('*')
    .not('status', 'in', '(moved-in,inactive)');

  if (participantsError) throw participantsError;

  const matches: PropertyMatch[] = [];

  for (const participant of participants || []) {
    const match = calculateMatchScore(participant, property);
    if (match.match_score >= 40) {
      matches.push(match);
    }
  }

  return matches;
}

async function matchAllParticipantsToProperties(
  supabaseClient: any
): Promise<PropertyMatch[]> {
  // Fetch all active participants
  const { data: participants, error: participantsError } = await supabaseClient
    .from('participants')
    .select('*')
    .not('status', 'in', '(moved-in,inactive)');

  if (participantsError) throw participantsError;

  // Fetch all available properties
  const { data: properties, error: propertiesError } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('visible_on_participant_site', true);

  if (propertiesError) throw propertiesError;

  const matches: PropertyMatch[] = [];

  for (const participant of participants || []) {
    for (const property of properties || []) {
      const match = calculateMatchScore(participant, property);
      if (match.match_score >= 40) {
        matches.push(match);
      }
    }
  }

  return matches;
}

function calculateMatchScore(participant: any, property: any): PropertyMatch {
  let score = 0;
  const reasons: MatchReason[] = [];

  // LOCATION MATCH (30 points max)
  const locationScore = calculateLocationMatch(participant, property);
  if (locationScore > 0) {
    score += locationScore;
    reasons.push({
      reason: 'Location match',
      score: locationScore,
      details: `Property in ${property.address || 'preferred area'}`
    });
  }

  // BUDGET MATCH (25 points max)
  const budgetScore = calculateBudgetMatch(participant, property);
  if (budgetScore > 0) {
    score += budgetScore;
    reasons.push({
      reason: 'Within budget',
      score: budgetScore,
      details: `Weekly rent $${property.weekly_rent || 0}`
    });
  }

  // BEDROOMS MATCH (10 points max)
  const bedroomsScore = calculateBedroomsMatch(participant, property);
  if (bedroomsScore > 0) {
    score += bedroomsScore;
    reasons.push({
      reason: 'Bedroom requirements met',
      score: bedroomsScore,
      details: `${property.bedrooms || 0} bedrooms available`
    });
  }

  // BATHROOMS MATCH (10 points max)
  const bathroomsScore = calculateBathroomsMatch(participant, property);
  if (bathroomsScore > 0) {
    score += bathroomsScore;
    reasons.push({
      reason: 'Bathroom requirements met',
      score: bathroomsScore,
      details: `${property.bathrooms || 0} bathrooms available`
    });
  }

  // SDA CATEGORY MATCH (15 points max)
  const sdaScore = calculateSDAMatch(participant, property);
  if (sdaScore > 0) {
    score += sdaScore;
    reasons.push({
      reason: 'SDA category match',
      score: sdaScore,
      details: `${property.sda_category || 'Standard'} category`
    });
  }

  // ACCESSIBILITY FEATURES MATCH (10 points max)
  const accessibilityScore = calculateAccessibilityMatch(participant, property);
  if (accessibilityScore > 0) {
    score += accessibilityScore;
    reasons.push({
      reason: 'Accessibility features match',
      score: accessibilityScore,
      details: 'Required accessibility features available'
    });
  }

  return {
    property_id: property.id,
    participant_id: participant.id,
    match_score: Math.min(score, 100), // Cap at 100
    match_reasons: reasons.sort((a, b) => b.score - a.score), // Sort by score desc
  };
}

function calculateLocationMatch(participant: any, property: any): number {
  const preferredLocations = participant.preferred_locations || [];
  const propertyAddress = (property.address || '').toLowerCase();

  // Check if any preferred location appears in property address
  for (const location of preferredLocations) {
    if (propertyAddress.includes(location.toLowerCase())) {
      return 30; // Perfect match
    }
  }

  // Partial match logic (e.g., same state/region)
  // For now, return 0 if no exact match
  return 0;
}

function calculateBudgetMatch(participant: any, property: any): number {
  const maxBudget = participant.max_weekly_budget;
  const weeklyRent = property.weekly_rent;

  if (!maxBudget || !weeklyRent) return 0;

  if (weeklyRent <= maxBudget * 0.8) {
    return 25; // Well within budget
  } else if (weeklyRent <= maxBudget) {
    return 20; // Within budget
  } else if (weeklyRent <= maxBudget * 1.1) {
    return 10; // Slightly over budget (might be negotiable)
  }

  return 0; // Too expensive
}

function calculateBedroomsMatch(participant: any, property: any): number {
  const minBedrooms = participant.min_bedrooms || 1;
  const propertyBedrooms = property.bedrooms || 0;

  if (propertyBedrooms >= minBedrooms) {
    return 10;
  }

  return 0;
}

function calculateBathroomsMatch(participant: any, property: any): number {
  const minBathrooms = participant.min_bathrooms || 1;
  const propertyBathrooms = property.bathrooms || 0;

  if (propertyBathrooms >= minBathrooms) {
    return 10;
  }

  return 0;
}

function calculateSDAMatch(participant: any, property: any): number {
  const participantCategory = participant.sda_category;
  const propertyCategory = property.sda_category;

  if (!participantCategory || !propertyCategory) return 0;

  // Exact match
  if (participantCategory.toLowerCase() === propertyCategory.toLowerCase()) {
    return 15;
  }

  // Partial match (e.g., "Fully Accessible" can work for "Improved Liveability")
  return 5;
}

function calculateAccessibilityMatch(participant: any, property: any): number {
  const mobilityRequirements = participant.mobility_requirements || {};
  const propertyFeatures = property.features || [];

  let matchCount = 0;
  let totalRequirements = 0;

  // Check key accessibility requirements
  const requirementsMap: Record<string, string> = {
    wheelchair: 'Wheelchair Accessible',
    step_free: 'Step-free Entry',
    accessible_bathroom: 'Accessible Bathroom',
    wide_doorways: 'Wide Doorways',
  };

  for (const [key, featureName] of Object.entries(requirementsMap)) {
    if (mobilityRequirements[key] === true) {
      totalRequirements++;
      if (propertyFeatures.includes(featureName)) {
        matchCount++;
      }
    }
  }

  if (totalRequirements === 0) return 5; // No specific requirements, give some points

  // Calculate percentage match
  const matchPercentage = matchCount / totalRequirements;
  return Math.round(matchPercentage * 10);
}

async function sendMatchNotifications(
  supabaseClient: any,
  matches: PropertyMatch[]
): Promise<void> {
  // Group matches by participant
  const matchesByParticipant = new Map<string, PropertyMatch[]>();

  for (const match of matches) {
    if (!matchesByParticipant.has(match.participant_id)) {
      matchesByParticipant.set(match.participant_id, []);
    }
    matchesByParticipant.get(match.participant_id)!.push(match);
  }

  // Send notification for each participant with excellent matches
  for (const [participantId, participantMatches] of matchesByParticipant) {
    // Fetch participant email
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('email, full_name')
      .eq('id', participantId)
      .single();

    if (!participant?.email) continue;

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    console.log(`📧 Would send notification to ${participant.email}:`);
    console.log(`   ${participantMatches.length} excellent matches found`);
    console.log(`   Top match score: ${Math.max(...participantMatches.map(m => m.match_score))}`);

    // Log activity
    await supabaseClient.from('lead_activities').insert({
      participant_id: participantId,
      activity_type: 'match_notification_sent',
      activity_data: {
        match_count: participantMatches.length,
        top_score: Math.max(...participantMatches.map(m => m.match_score)),
      },
    });
  }
}
