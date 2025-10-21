-- Add unique constraint for property_matches to enable upserts
-- This prevents duplicate matches for the same participant-property pair

ALTER TABLE property_matches
ADD CONSTRAINT unique_participant_property UNIQUE (participant_id, property_id);

-- Add comment
COMMENT ON CONSTRAINT unique_participant_property ON property_matches IS 'Ensures one match per participant-property pair (prevents duplicates during AI matching)';

SELECT 'Added unique constraint to property_matches table' as status;
