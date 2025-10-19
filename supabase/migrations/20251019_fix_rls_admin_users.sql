-- ============================================================================
-- FIX: Create admin_users table referenced by RLS policies
-- ============================================================================
-- The RLS policies created in 20251019_ai_workflows.sql reference an
-- admin_users table that was never created. This migration fixes that.

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  organization_id text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_organization ON admin_users(organization_id);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own entries
CREATE POLICY "Users can view their own admin entries"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- Only authenticated users can be admins (controlled via backend/triggers)
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Insert current authenticated users as admins
-- ============================================================================
-- This will auto-assign any existing authenticated user to 'plcg' organization
-- You can manually update organization_id later if needed

INSERT INTO admin_users (user_id, organization_id, role)
SELECT
  id,
  'plcg',
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM admin_users)
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- ============================================================================
-- Function to auto-add new users to admin_users
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_add_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_users (user_id, organization_id, role)
  VALUES (NEW.id, 'plcg', 'admin')
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-add new users
DROP TRIGGER IF EXISTS on_auth_user_created_add_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_add_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_admin_user();

COMMENT ON TABLE admin_users IS 'Maps authenticated users to organizations for RLS policies';
COMMENT ON FUNCTION auto_add_admin_user IS 'Auto-adds new authenticated users to admin_users with plcg organization';
