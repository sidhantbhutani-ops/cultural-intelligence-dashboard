-- Migration: Add Broadway analysis columns
-- Date: Sept 30, 2026
-- Description: Add columns for brand activations, action mapping, and consumption triggers

ALTER TABLE trends
ADD COLUMN IF NOT EXISTS brand_activations JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS action_mapping JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS consumption_triggers JSONB DEFAULT NULL;

-- Create index for faster queries on analysis data
CREATE INDEX IF NOT EXISTS idx_trends_brand_activations ON trends USING GIN(brand_activations);
CREATE INDEX IF NOT EXISTS idx_trends_action_mapping ON trends USING GIN(action_mapping);
CREATE INDEX IF NOT EXISTS idx_trends_consumption_triggers ON trends USING GIN(consumption_triggers);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trends' 
AND column_name IN ('brand_activations', 'action_mapping', 'consumption_triggers')
ORDER BY ordinal_position;
