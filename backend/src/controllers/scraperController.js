const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const runScraper = require('../scraper/index.js');

async function getStatus(req, res) {
  try {
    const result = await query(
      `SELECT id, run_id, status, started_at, completed_at, trends_found, 
              trends_created, trends_skipped, error_message, duration_seconds
       FROM scraper_logs
       ORDER BY started_at DESC
       LIMIT 5`
    );

    const lastRuns = result.rows.map(row => ({
      runId: row.run_id,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      itemsFetched: row.trends_found,
      trendsCreated: row.trends_created,
      trendsSkipped: row.trends_skipped,
      durationSeconds: row.duration_seconds,
      errorMessage: row.error_message,
    }));

    res.json({
      success: true,
      lastRuns,
    });
  } catch (err) {
    console.error('[Admin] Status query failed:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function triggerRun(req, res) {
  try {
    const runId = `run-${uuidv4()}`;

    // Start scraper async in background
    runScraper.run()
      .then(() => {
        console.log(`[Admin] Run ${runId} completed successfully`);
      })
      .catch(err => {
        console.error(`[Admin] Run ${runId} failed:`, err.message);
      });

    res.json({
      success: true,
      runId,
      status: 'started',
      message: 'Scraper job triggered',
    });
  } catch (err) {
    console.error('[Admin] Trigger run failed:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

module.exports = {
  getStatus,
  triggerRun,
};
