-- Fix RLS policies for SDA conversion search system
-- Problem: Policies were checking admin_users.id instead of admin_users.user_id
-- admin_users.id is the PRIMARY KEY, admin_users.user_id is the auth.users foreign key

-- =====================================================
-- Fix conversion_search_requests policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view search requests in their organization" ON conversion_search_requests;
DROP POLICY IF EXISTS "Users can create search requests in their organization" ON conversion_search_requests;
DROP POLICY IF EXISTS "Users can update search requests in their organization" ON conversion_search_requests;

CREATE POLICY "Users can view search requests in their organization"
  ON conversion_search_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create search requests in their organization"
  ON conversion_search_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update search requests in their organization"
  ON conversion_search_requests FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Fallback policy: Allow authenticated users without admin_users record
CREATE POLICY "Authenticated users can create search requests"
  ON conversion_search_requests FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

-- =====================================================
-- Fix conversion_search_results policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view search results for their org requests" ON conversion_search_results;
DROP POLICY IF EXISTS "Users can insert search results for their org requests" ON conversion_search_results;
DROP POLICY IF EXISTS "Users can update search results for their org requests" ON conversion_search_results;

CREATE POLICY "Users can view search results for their org requests"
  ON conversion_search_results FOR SELECT
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert search results for their org requests"
  ON conversion_search_results FOR INSERT
  WITH CHECK (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update search results for their org requests"
  ON conversion_search_results FOR UPDATE
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- Fix search_approvals policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view approvals for their org requests" ON search_approvals;
DROP POLICY IF EXISTS "Users can create approvals for their org requests" ON search_approvals;
DROP POLICY IF EXISTS "Users can update approvals for their org requests" ON search_approvals;

CREATE POLICY "Users can view approvals for their org requests"
  ON search_approvals FOR SELECT
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create approvals for their org requests"
  ON search_approvals FOR INSERT
  WITH CHECK (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update approvals for their org requests"
  ON search_approvals FOR UPDATE
  USING (
    search_request_id IN (
      SELECT id FROM conversion_search_requests
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- Fix search_to_property_mappings policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view mappings for their org properties" ON search_to_property_mappings;
DROP POLICY IF EXISTS "Users can create mappings for their org properties" ON search_to_property_mappings;

CREATE POLICY "Users can view mappings for their org properties"
  ON search_to_property_mappings FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create mappings for their org properties"
  ON search_to_property_mappings FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties
      WHERE organization_id IN (
        SELECT organization_id FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

SELECT 'RLS policies fixed for all conversion search tables' AS status;
