CREATE TABLE IF NOT EXISTS micro_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- WHAT: Post metadata
  source TEXT NOT NULL DEFAULT 'reddit',
  subreddit TEXT NOT NULL,
  post_id TEXT NOT NULL UNIQUE,
  post_title TEXT NOT NULL,
  post_url TEXT NOT NULL,
  post_author TEXT,
  
  -- WHEN: Timing
  posted_at TIMESTAMP NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  days_old INT GENERATED ALWAYS AS (EXTRACT(DAY FROM NOW() - posted_at)) STORED,
  
  -- HOW MUCH: Engagement
  upvotes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  engagement_score INT GENERATED ALWAYS AS (upvotes + (comments_count * 2)) STORED,
  
  -- WHAT'S TRENDING
  trend_topic TEXT NOT NULL,
  mentioned_products TEXT[],
  mentioned_brands TEXT[],
  
  -- WHY IT'S TRENDING
  trend_drivers TEXT[] NOT NULL,
  catalyst_summary TEXT NOT NULL,
  top_comments JSONB,
  
  -- WHO CARES
  geographic_scope TEXT DEFAULT 'india',
  target_demographic TEXT,
  
  -- BROADWAY RELEVANCE
  broadway_relevance_score INT CHECK (broadway_relevance_score BETWEEN 0 AND 100),
  broadway_relevance_reason TEXT,
  relevant_broadway_categories TEXT[],
  
  -- ANALYSIS
  analysis_confidence INT CHECK (analysis_confidence BETWEEN 0 AND 100),
  category TEXT NOT NULL,
  sentiment TEXT,
  
  -- TRACKING
  run_id TEXT,
  analyzed_at TIMESTAMP,
  
  CONSTRAINT valid_category CHECK (category IN ('beauty', 'fashion', 'wellness', 'lifestyle', 'streetwear', 'footwear', 'general')),
  CONSTRAINT valid_sentiment CHECK (sentiment IN ('positive', 'neutral', 'mixed', 'negative'))
);

CREATE INDEX IF NOT EXISTS idx_engagement_score ON micro_trends(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_broadway_relevance ON micro_trends(broadway_relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_days_old ON micro_trends(days_old ASC);
CREATE INDEX IF NOT EXISTS idx_category ON micro_trends(category);
CREATE INDEX IF NOT EXISTS idx_posted_at ON micro_trends(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_subreddit ON micro_trends(subreddit);
