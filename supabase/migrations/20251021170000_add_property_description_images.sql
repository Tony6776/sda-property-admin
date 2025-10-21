-- Add description and images to properties table

-- Add description column
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS description text;

-- Add images array column for property photos
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS images text[];

-- Add primary_image for the main property photo
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS primary_image text;

-- Create index on visible properties for faster querying
CREATE INDEX IF NOT EXISTS idx_properties_visible_participant
ON properties(visible_on_participant_site)
WHERE visible_on_participant_site = true;

CREATE INDEX IF NOT EXISTS idx_properties_status
ON properties(status)
WHERE status = 'available';

-- Add comment
COMMENT ON COLUMN properties.description IS 'Detailed description of the property';
COMMENT ON COLUMN properties.images IS 'Array of image URLs for the property';
COMMENT ON COLUMN properties.primary_image IS 'Main/featured image URL for the property';
