-- Add RAD scoring columns to trends table
ALTER TABLE trends
ADD COLUMN rare_score INTEGER DEFAULT 0,
ADD COLUMN auth_score INTEGER DEFAULT 0,
ADD COLUMN dis_score INTEGER DEFAULT 0,
ADD COLUMN social_score INTEGER DEFAULT 0,
ADD COLUMN total_rad_score INTEGER GENERATED ALWAYS AS (rare_score + auth_score + dis_score + social_score) STORED,
ADD COLUMN editorial_insight TEXT;

-- Add index for sorting by RAD score
CREATE INDEX idx_trends_total_rad_score ON trends(total_rad_score DESC);
CREATE INDEX idx_trends_rare_score ON trends(rare_score DESC);
