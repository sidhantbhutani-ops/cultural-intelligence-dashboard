const { fetchRss } = require('./fetchers/rss');
const { fetchHtml } = require('./fetchers/html');
const { fetchReddit } = require('./fetchers/reddit');
const { deduplicateItems } = require('./deduplicator');
const { analyzeItems } = require('./analyzer');
const supabase = require('../config/supabase');

async function runScraper(passedRunId) {
  const runId = passedRunId || `run_${Date.now()}`;
  const startTime = new Date();
  let totalItemsFetched = 0;
  let totalTrendsCreated = 0;

  try {
    console.log(`[${runId}] Starting scraper run...`);

    // Insert scraper log entry
    const { error: logError } = await supabase.query(
      `INSERT INTO scraper_logs (run_id, status, started_at, trends_found, trends_created)
       VALUES ($1, $2, $3, $4, $5)`,
      [runId, 'running', startTime.toISOString(), 0, 0]
    );
    if (logError) throw logError;

    // Fetch all active sources
    const { rows: sources } = await supabase.query(
      `SELECT * FROM scraper_sources WHERE is_active = true`
    );

    if (!sources || sources.length === 0) {
      throw new Error('No active sources found');
    }

    console.log(`[${runId}] Found ${sources.length} active sources`);

    // Fetch from all sources in parallel
    const allItems = [];
    const fetchPromises = sources.map(async (source) => {
      try {
        let items = [];

        if (source.scrape_strategy === 'rss' || source.scrape_strategy === 'rss_feed') {
          items = await fetchRss(source);
        } else if (source.scrape_strategy === 'html') {
          items = await fetchHtml(source);
        } else if (source.scrape_strategy === 'reddit') {
          items = await fetchReddit(source);
        } else {
          console.warn(`[${runId}] Unknown scrape strategy: ${source.scrape_strategy}`);
        }

        totalItemsFetched += items.length;
        allItems.push(...items);
        console.log(`[${runId}] Fetched ${items.length} items from ${source.name}`);
      } catch (error) {
        console.error(`[${runId}] Error fetching from ${source.name}:`, error.message);
      }
    });

    await Promise.all(fetchPromises);

    if (allItems.length === 0) {
      console.warn(`[${runId}] No items fetched from any source`);
      await supabase.query(
        `UPDATE scraper_logs SET status = $1, completed_at = $2, trends_found = $3, error_message = $4
         WHERE run_id = $5`,
        ['completed', new Date().toISOString(), 0, 'No items fetched', runId]
      );
      return { runId, success: true, itemsFetched: 0, trendsCreated: 0, storedTrends: [] };
    }

    console.log(`[${runId}] Fetched ${allItems.length} total items`);

    // Deduplicate
    const uniqueItems = deduplicateItems(allItems);
    console.log(`[${runId}] Deduplicated to ${uniqueItems.length} unique items`);

    // Analyze with Claude
    const analyzedTrends = await analyzeItems(uniqueItems);
    console.log(`[${runId}] Analyzed ${analyzedTrends.length} trends`);

    // Store trends and auto-score
    totalTrendsCreated = await storeAnalyzedTrends(analyzedTrends, runId);

    // Update scraper log
    const completedAt = new Date();
    const durationSeconds = Math.round((completedAt - startTime) / 1000);

    await supabase.query(
      `UPDATE scraper_logs SET status = $1, completed_at = $2, trends_found = $3, trends_created = $4, duration_seconds = $5
       WHERE run_id = $6`,
      ['completed', completedAt.toISOString(), totalItemsFetched, totalTrendsCreated, durationSeconds, runId]
    );

    console.log(`[${runId}] Scraper completed successfully`);
    return { runId, success: true, itemsFetched: totalItemsFetched, trendsCreated: totalTrendsCreated, storedTrends: analyzedTrends };
  } catch (error) {
    console.error(`[${runId}] Scraper failed:`, error.message);
    await supabase.query(
      `UPDATE scraper_logs SET status = $1, completed_at = $2, error_message = $3 WHERE run_id = $4`,
      ['failed', new Date().toISOString(), error.message, runId]
    );
    throw error;
  }
}

async function storeAnalyzedTrends(trends, runId) {
  let createdCount = 0;
  const { scoreTrend } = require('../services/radScorer');

  for (const trend of trends) {
    try {
      const { rows } = await supabase.query(
        `INSERT INTO trends (title, source, source_url, description, category, angles, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (source_url) DO NOTHING
         RETURNING id`,
        [
          trend.title,
          trend.source,
          trend.source_url,
          trend.description,
          trend.category,
          JSON.stringify(trend.angles || []),
          new Date().toISOString(),
        ]
      );

      if (rows && rows.length > 0) {
        createdCount++;
        const trendId = rows[0].id;

        // Auto-score async (non-blocking)
        scoreTrend({ id: trendId, ...trend }).catch((err) => {
          console.warn(`[${runId}] Scoring error for trend ${trendId}:`, err.message);
        });
      }
    } catch (error) {
      console.error(`[${runId}] Error storing trend:`, error.message);
    }
  }

  return createdCount;
}

module.exports = { runScraper, run: runScraper };
