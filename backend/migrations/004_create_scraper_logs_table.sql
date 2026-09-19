CREATE TABLE scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL,
  trends_found INTEGER,
  trends_created INTEGER,
  trends_skipped INTEGER,
  error_message TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  sources_scraped TEXT[],
  triggered_by VARCHAR(255)
);

CREATE INDEX idx_scraper_logs_started_at ON scraper_logs(started_at DESC);
CREATE INDEX idx_scraper_logs_status ON scraper_logs(status);
