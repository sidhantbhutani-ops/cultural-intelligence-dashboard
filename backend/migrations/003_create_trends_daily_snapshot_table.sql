CREATE TABLE trends_daily_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  engagement_metric INTEGER NOT NULL,
  velocity VARCHAR(20),
  snapshot_at DATE NOT NULL,
  UNIQUE(trend_id, snapshot_at)
);

CREATE INDEX idx_trends_daily_snapshot_trend_id ON trends_daily_snapshot(trend_id);
CREATE INDEX idx_trends_daily_snapshot_date ON trends_daily_snapshot(snapshot_at DESC);
CREATE INDEX idx_trends_daily_snapshot_trend_date ON trends_daily_snapshot(trend_id, snapshot_at DESC);
