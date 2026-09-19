const { query } = require('../config/supabase');

async function createTrend(trendData) {
  const {
    title,
    description,
    source,
    source_url,
    engagement_metric,
    happening,
    cultural_significance,
    angles,
    category,
    velocity,
    scraped_by,
  } = trendData;

  const result = await query(
    `INSERT INTO trends (
      title, description, source, source_url, engagement_metric,
      happening, cultural_significance, angles, category, velocity, scraped_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [title, description, source, source_url, engagement_metric, happening, cultural_significance, angles, category, velocity, scraped_by]
  );

  return result.rows[0];
}

async function getTrendBySourceUrl(source_url) {
  const result = await query('SELECT * FROM trends WHERE source_url = $1', [source_url]);
  return result.rows[0] || null;
}

async function updateTrendVelocity(trendId, newVelocity) {
  const result = await query(
    'UPDATE trends SET velocity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [newVelocity, trendId]
  );
  return result.rows[0];
}

async function markAsPickedUp(trendId, userId) {
  const result = await query(
    'UPDATE trends SET picked_up = true, picked_up_by = $1, picked_up_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [userId, trendId]
  );
  return result.rows[0];
}

async function archiveTrends(daysOld = 14) {
  const result = await query(
    `UPDATE trends 
    SET archived_at = CURRENT_TIMESTAMP 
    WHERE archived_at IS NULL 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
    RETURNING id`,
    [daysOld]
  );
  return result.rows;
}

module.exports = {
  query,
  createTrend,
  getTrendBySourceUrl,
  updateTrendVelocity,
  markAsPickedUp,
  archiveTrends,
};
