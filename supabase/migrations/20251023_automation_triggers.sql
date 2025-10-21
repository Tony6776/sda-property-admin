-- =====================================================
-- AUTOMATION TRIGGERS & CRON JOBS
-- Migration: 20251023_automation_triggers.sql
-- =====================================================

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Enable pg_cron extension for scheduled jobs
-- Note: This requires superuser access and may need to be run manually in production
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- 1. TRIGGER FUNCTIONS
-- =====================================================

-- Function to call Edge Functions via HTTP
CREATE OR REPLACE FUNCTION call_edge_function(
  function_name TEXT,
  payload JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT net.http_post(
    url := 'https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/' || function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIyNjk0MCwiZXhwIjoyMDY5ODAyOTQwfQ.3s8fFVrDyJmMwbpo9OXx03GyV5JT3M8sVEUAV8_qhh4'
    ),
    body := payload
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. AUTO-MATCH NEW PARTICIPANTS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_auto_match_participant()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if pathway_preference is set
  IF NEW.pathway_preference IS NOT NULL THEN
    PERFORM call_edge_function(
      'ai-matcher',
      jsonb_build_object(
        'action', 'match_participant',
        'participant_id', NEW.id,
        'pathway_type', NEW.pathway_preference
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_match_new_participant ON participants;
CREATE TRIGGER auto_match_new_participant
  AFTER INSERT ON participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_match_participant();

DROP TRIGGER IF EXISTS auto_match_updated_participant ON participants;
CREATE TRIGGER auto_match_updated_participant
  AFTER UPDATE OF pathway_preference ON participants
  FOR EACH ROW
  WHEN (NEW.pathway_preference IS DISTINCT FROM OLD.pathway_preference)
  EXECUTE FUNCTION trigger_auto_match_participant();

-- =====================================================
-- 3. AUTO-GENERATE SDA PROPERTY REPORT ON AGREEMENT SIGNED
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_sda_property_report()
RETURNS TRIGGER AS $$
BEGIN
  -- When participant signs service agreement, generate report
  IF NEW.sda_service_agreement_signed = TRUE AND
     (OLD.sda_service_agreement_signed IS NULL OR OLD.sda_service_agreement_signed = FALSE) THEN

    PERFORM call_edge_function(
      'report-generator',
      jsonb_build_object(
        'action', 'generate_sda_property_report',
        'participant_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_sda_report ON participants;
CREATE TRIGGER auto_generate_sda_report
  AFTER UPDATE OF sda_service_agreement_signed ON participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sda_property_report();

-- =====================================================
-- 4. AUTO-NOTIFY INVESTORS ON HIGH DEMAND CONVERSION PROPERTIES
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_investor_hot_buy()
RETURNS TRIGGER AS $$
BEGIN
  -- When conversion property has confirmed demand > 0, notify investors
  IF NEW.confirmed_participant_demand > 0 AND
     NEW.overall_conversion_score >= 75 AND
     (OLD.confirmed_participant_demand = 0 OR OLD.confirmed_participant_demand IS NULL) THEN

    -- This would typically trigger investor opportunity matching
    -- For now, just log it
    RAISE NOTICE 'High-demand conversion property: % with % confirmed participants',
      NEW.property_address, NEW.confirmed_participant_demand;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_notify_investors ON conversion_properties;
CREATE TRIGGER auto_notify_investors
  AFTER UPDATE OF confirmed_participant_demand ON conversion_properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_investor_hot_buy();

-- =====================================================
-- 5. CRON JOBS (Run manually or via Supabase Dashboard)
-- =====================================================

-- Note: These cron jobs require pg_cron extension which needs superuser access
-- Run these via Supabase Dashboard → Database → Cron Jobs

/*

-- Daily Property Scan (6 AM AEST)
SELECT cron.schedule(
  'daily-property-scan',
  '0 6 * * *',
  $$
  SELECT call_edge_function(
    'property-scanner',
    '{"action": "scan"}'::jsonb
  );
  $$
);

-- Daily Batch Matching (7 AM AEST - after property scan)
SELECT cron.schedule(
  'daily-batch-match',
  '0 7 * * *',
  $$
  SELECT call_edge_function(
    'ai-matcher',
    '{"action": "batch_match_all"}'::jsonb
  );
  $$
);

-- Daily Follow-Up Check (9 AM AEST)
SELECT cron.schedule(
  'daily-follow-up',
  '0 9 * * *',
  $$
  -- Check for stale matches (sent > 7 days ago, no response)
  UPDATE property_matches
  SET status = 'follow_up_needed'
  WHERE status = 'sent'
    AND sent_at < NOW() - INTERVAL '7 days'
    AND confirmed_at IS NULL;
  $$
);

-- View scheduled cron jobs
SELECT * FROM cron.job;

-- Unschedule a job if needed
SELECT cron.unschedule('daily-property-scan');

*/

-- =====================================================
-- 6. HELPER VIEWS FOR MONITORING
-- =====================================================

-- View for matches pending approval
CREATE OR REPLACE VIEW pending_matches AS
SELECT
  pm.id,
  pm.participant_id,
  p.name as participant_name,
  pm.property_id,
  prop.name as property_name,
  pm.pathway_type,
  pm.ai_match_score,
  pm.status,
  pm.created_at
FROM property_matches pm
JOIN participants p ON p.id = pm.participant_id
LEFT JOIN properties prop ON prop.id = pm.property_id
WHERE pm.status = 'pending_approval'
ORDER BY pm.ai_match_score DESC, pm.created_at DESC;

-- View for high-score conversion properties
CREATE OR REPLACE VIEW hot_conversion_properties AS
SELECT
  id,
  property_address,
  suburb,
  purchase_price,
  conversion_cost_estimate,
  total_cost,
  overall_conversion_score,
  confirmed_participant_demand,
  interested_investors_count,
  status,
  scanned_at
FROM conversion_properties
WHERE overall_conversion_score >= 75
  AND status IN ('scanned', 'matched')
ORDER BY confirmed_participant_demand DESC, overall_conversion_score DESC;

-- View for stale matches (need follow-up)
CREATE OR REPLACE VIEW stale_matches AS
SELECT
  pm.id,
  pm.participant_id,
  p.name as participant_name,
  pm.property_id,
  pm.pathway_type,
  pm.sent_at,
  EXTRACT(DAY FROM (NOW() - pm.sent_at)) as days_since_sent
FROM property_matches pm
JOIN participants p ON p.id = pm.participant_id
WHERE pm.status = 'sent'
  AND pm.sent_at < NOW() - INTERVAL '7 days'
  AND pm.confirmed_at IS NULL
ORDER BY pm.sent_at ASC;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON pending_matches TO anon, authenticated;
GRANT SELECT ON hot_conversion_properties TO anon, authenticated;
GRANT SELECT ON stale_matches TO anon, authenticated;

-- =====================================================
-- 8. SUCCESS MESSAGE
-- =====================================================

SELECT 'Automation triggers and helpers created successfully!' as status;

COMMENT ON FUNCTION trigger_auto_match_participant() IS 'Auto-matches new participants to properties based on their pathway preference';
COMMENT ON FUNCTION trigger_sda_property_report() IS 'Auto-generates SDA Property Report when participant signs $5.5k service agreement';
COMMENT ON FUNCTION trigger_investor_hot_buy() IS 'Notifies investors when conversion property has confirmed participant demand';
COMMENT ON VIEW pending_matches IS 'All property matches pending admin approval, sorted by match score';
COMMENT ON VIEW hot_conversion_properties IS 'High-score conversion properties (75+) with participant demand';
COMMENT ON VIEW stale_matches IS 'Matches sent >7 days ago with no response (need follow-up)';
