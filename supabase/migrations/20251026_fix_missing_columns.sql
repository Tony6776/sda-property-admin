-- Migration: Fix Missing Columns in Existing Tables
-- Purpose: Add any missing columns to participants, tenancies, and ndia_payment_batches
-- Date: 2025-10-26
--
-- NOTE: Tables may exist from Supabase dashboard creation or external migrations
-- This migration ensures all required columns exist

-- ============================================
-- FIX PARTICIPANTS TABLE
-- ============================================

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Core columns
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS name TEXT; -- Aliased from full_name
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS full_name TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS date_of_birth DATE;

  -- NDIS columns
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS ndis_number TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS ndis_plan_expiry DATE;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS disability_category TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS sda_funding_level NUMERIC;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS sda_category TEXT;

  -- Preferences
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS preferred_locations TEXT[];
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS max_weekly_budget NUMERIC;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS min_bedrooms INTEGER DEFAULT 1;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS min_bathrooms INTEGER DEFAULT 1;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS mobility_requirements JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS support_needs JSONB DEFAULT '{}'::jsonb;

  -- Pathway
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS pathway_interest TEXT[];
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS deposit_available NUMERIC;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS pathway_preference TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12,2);

  -- Lead management
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS lead_source TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS engagement_level TEXT DEFAULT 'cold';
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS participant_status TEXT DEFAULT 'new';
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS priority_level TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS assigned_agent UUID;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS support_coordinator_email TEXT;

  -- Documents
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS ndis_plan_uploaded BOOLEAN DEFAULT false;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS id_uploaded BOOLEAN DEFAULT false;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS income_proof_uploaded BOOLEAN DEFAULT false;

  -- Location (added by later migrations)
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS location_preference TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS preferred_suburbs TEXT[];
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2);

  -- Metadata
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS notes TEXT;
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS tags TEXT[];
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
  ALTER TABLE participants ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
END$$;

-- Indexes for participants (IF NOT EXISTS is supported)
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(participant_status);
CREATE INDEX IF NOT EXISTS idx_participants_lead_score ON participants(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_participants_engagement ON participants(engagement_level);
CREATE INDEX IF NOT EXISTS idx_participants_location ON participants(location_preference);

-- Enable RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Simple policy for testing
DROP POLICY IF EXISTS "participants_service_role_access" ON participants;
CREATE POLICY "participants_service_role_access" ON participants
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "participants_authenticated_access" ON participants;
CREATE POLICY "participants_authenticated_access" ON participants
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

SELECT 'Participants table columns fixed' AS status;
