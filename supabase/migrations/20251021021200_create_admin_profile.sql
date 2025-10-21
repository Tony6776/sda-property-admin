-- Create admin profile for existing auth user
-- User: admin@homelander.com.au
-- User ID: 7b1fb4f6-42b5-422e-9e25-c03a0d0aeaa1

-- Insert admin profile (using ON CONFLICT in case it already exists)
INSERT INTO profiles (user_id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  '7b1fb4f6-42b5-422e-9e25-c03a0d0aeaa1',
  'admin@homelander.com.au',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'admin',
  is_active = true,
  email = 'admin@homelander.com.au',
  full_name = 'Admin User',
  updated_at = NOW();

-- Verify the profile was created
SELECT
  user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE user_id = '7b1fb4f6-42b5-422e-9e25-c03a0d0aeaa1';
