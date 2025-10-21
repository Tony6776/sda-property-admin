-- Migration: Add Refurbishment Profit Tracking
-- Purpose: Track actual refurbishment costs vs client charges to document build profit
-- Date: 2025-10-27

-- Add refurbishment tracking columns to conversion_properties
ALTER TABLE conversion_properties
ADD COLUMN IF NOT EXISTS refurbishment_cost_estimate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS refurbishment_amount_charged NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS refurbishment_profit_margin NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS refurbishment_profit_percentage NUMERIC(5,2);

-- Add comments
COMMENT ON COLUMN conversion_properties.refurbishment_cost_estimate IS 'Estimated actual cost of refurbishment work';
COMMENT ON COLUMN conversion_properties.refurbishment_amount_charged IS 'Amount charged to client for refurbishment';
COMMENT ON COLUMN conversion_properties.refurbishment_profit_margin IS 'Profit margin: charged - actual cost';
COMMENT ON COLUMN conversion_properties.refurbishment_profit_percentage IS 'Profit percentage: (margin / charged) * 100';

-- Create function to auto-calculate profit margins
CREATE OR REPLACE FUNCTION calculate_refurbishment_profit()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate profit margin if both cost and charged amount are set
  IF NEW.refurbishment_cost_estimate IS NOT NULL AND NEW.refurbishment_amount_charged IS NOT NULL THEN
    NEW.refurbishment_profit_margin := NEW.refurbishment_amount_charged - NEW.refurbishment_cost_estimate;
    
    -- Calculate profit percentage
    IF NEW.refurbishment_amount_charged > 0 THEN
      NEW.refurbishment_profit_percentage := (NEW.refurbishment_profit_margin / NEW.refurbishment_amount_charged) * 100;
    ELSE
      NEW.refurbishment_profit_percentage := 0;
    END IF;
  ELSE
    NEW.refurbishment_profit_margin := NULL;
    NEW.refurbishment_profit_percentage := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate on insert/update
DROP TRIGGER IF EXISTS trigger_calculate_refurbishment_profit ON conversion_properties;

CREATE TRIGGER trigger_calculate_refurbishment_profit
BEFORE INSERT OR UPDATE OF refurbishment_cost_estimate, refurbishment_amount_charged
ON conversion_properties
FOR EACH ROW
EXECUTE FUNCTION calculate_refurbishment_profit();

-- Add index for profit margin queries
CREATE INDEX IF NOT EXISTS idx_conversion_properties_refurbishment_profit 
ON conversion_properties(refurbishment_profit_margin) 
WHERE refurbishment_profit_margin IS NOT NULL;

SELECT 'Refurbishment profit tracking added successfully' AS status;
