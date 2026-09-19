CREATE TABLE scraper_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  source_type VARCHAR(50) NOT NULL,
  base_url TEXT NOT NULL,
  api_key VARCHAR(500),
  headers JSONB,
  query_params JSONB,
  scrape_strategy VARCHAR(50) NOT NULL,
  engagement_metric VARCHAR(50),
  rate_limit_per_hour INTEGER DEFAULT 100,
  concurrent_requests INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  last_successful_fetch TIMESTAMP,
  last_error TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

CREATE INDEX idx_scraper_sources_active ON scraper_sources(is_active);
CREATE INDEX idx_scraper_sources_priority ON scraper_sources(priority);
CREATE INDEX idx_scraper_sources_type ON scraper_sources(source_type);
