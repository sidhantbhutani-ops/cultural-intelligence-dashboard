CREATE TABLE team_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  content TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_actions_trend_id ON team_actions(trend_id);
CREATE INDEX idx_team_actions_user_id ON team_actions(user_id);
CREATE INDEX idx_team_actions_action_type ON team_actions(action_type);
CREATE INDEX idx_team_actions_created_at ON team_actions(created_at DESC);
CREATE INDEX idx_team_actions_active ON team_actions(deleted_at);
CREATE INDEX idx_team_actions_trend_date ON team_actions(trend_id, created_at DESC) WHERE deleted_at IS NULL;
