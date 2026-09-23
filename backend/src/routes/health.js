const express = require('express');
const { query } = require('../config/supabase');
const router = express.Router();

router.get('/scraper-health', async (req, res) => {
  try {
    // Get last 5 scraper runs
    const runsResult = await query(`
      SELECT 
        id as run_id,
        started_at,
        items_fetched,
        EXTRACT(EPOCH FROM (completed_at - started_at))::int as duration_seconds,
        error_message
      FROM scraper_logs
      WHERE completed_at IS NOT NULL
      ORDER BY started_at DESC
      LIMIT 5
    `);

    const runs = runsResult.rows || [];

    // Count trends created per run
    const runsWithTrends = await Promise.all(
      runs.map(async (run) => {
        const startTime = new Date(run.started_at);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        
        const trendsResult = await query(`
          SELECT COUNT(*) as count FROM trends
          WHERE created_at >= $1 AND created_at < $2
        `, [startTime.toISOString(), endTime.toISOString()]);
        
        const trendsCreated = parseInt(trendsResult.rows?.[0]?.count || 0);
        return { ...run, trendsCreated };
      })
    );

    // Get active sources
    const sourcesResult = await query(`
      SELECT name, is_active, created_at
      FROM scraper_sources
      WHERE is_active = true
    `);

    const sources = sourcesResult.rows || [];

    // Calculate freshness from latest run
    const latestRun = runsWithTrends[0];
    const itemsFetched = latestRun?.items_fetched || 0;
    const trendsCreated = latestRun?.trendsCreated || 0;
    const freshRate = itemsFetched > 0
      ? ((trendsCreated / itemsFetched) * 100).toFixed(1)
      : 0;

    const isHealthy = freshRate >= 30;
    const status = isHealthy ? 'HEALTHY' : 'STALE_SOURCES';

    res.json({
      status,
      lastRun: {
        runId: latestRun?.run_id,
        timestamp: latestRun?.started_at,
        itemsFetched,
        trendsCreated,
        freshRate: `${freshRate}%`,
        durationSeconds: latestRun?.duration_seconds,
        error: latestRun?.error_message
      },
      activeSources: sources.length,
      recommendation: isHealthy 
        ? '✅ Sources are healthy' 
        : '⚠️ Fresh content rate below 30% - add new sources'
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
