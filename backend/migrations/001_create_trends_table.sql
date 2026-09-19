CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  engagement_metric INTEGER NOT NULL DEFAULT 0,
  happening TEXT NOT NULL,
  cultural_significance TEXT NOT NULL,
  angles TEXT[] NOT NULL,
  category VARCHAR(50) NOT NULL,
  velocity VARCHAR(20) NOT NULL DEFAULT 'emerging',
  picked_up BOOLEAN DEFAULT FALSE,
  picked_up_by VARCHAR(255),
  picked_up_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP,
  scraped_by VARCHAR(100) DEFAULT 'scraper-default'
);

CREATE INDEX idx_trends_created_at ON trends(created_at DESC);
CREATE INDEX idx_trends_archived_at ON trends(archived_at);
CREATE INDEX idx_trends_category ON trends(category);
CREATE INDEX idx_trends_source ON trends(source);
CREATE INDEX idx_trends_velocity ON trends(velocity);
CREATE INDEX idx_trends_picked_up ON trends(picked_up);
CREATE INDEX idx_trends_status ON trends(archived_at, picked_up);
CREATE UNIQUE INDEX idx_trends_source_url_unique ON trends(source_url);
