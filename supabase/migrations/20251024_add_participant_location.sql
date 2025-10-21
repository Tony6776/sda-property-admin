-- Add missing location fields to participants table
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS location_preference TEXT,
ADD COLUMN IF NOT EXISTS preferred_suburbs TEXT[],
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add index for location-based searches
CREATE INDEX IF NOT EXISTS idx_participants_location ON participants(location_preference);

-- Add comments
COMMENT ON COLUMN participants.location_preference IS 'Preferred location/suburb for property matching (e.g., Melbourne, Doncaster)';
COMMENT ON COLUMN participants.preferred_suburbs IS 'Array of preferred suburbs for more specific matching';
COMMENT ON COLUMN participants.budget IS 'Total property budget (alternative to deposit_amount for participants without specific deposit)';
COMMENT ON COLUMN participants.email IS 'Participant contact email';
COMMENT ON COLUMN participants.phone IS 'Participant contact phone';

SELECT 'Added location and contact fields to participants table' as status;
