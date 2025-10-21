-- Create admin_users record for existing auth user
-- This links the auth user to the admin_users table with organization

-- Insert admin_users record (using ON CONFLICT in case it already exists)
INSERT INTO admin_users (user_id, organization_id, role, full_name, created_at, updated_at)
VALUES (
  '7b1fb4f6-42b5-422e-9e25-c03a0d0aeaa1',  -- admin@homelander.com.au user_id
  'homelander',                              -- organization_id
  'admin',                                   -- role
  'Admin User',                              -- full_name
  NOW(),
  NOW()
)
ON CONFLICT (user_id, organization_id)
DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User',
  updated_at = NOW();

-- Verify the admin_users record was created
SELECT
  id,
  user_id,
  organization_id,
  role,
  full_name,
  created_at
FROM admin_users
WHERE user_id = '7b1fb4f6-42b5-422e-9e25-c03a0d0aeaa1';
