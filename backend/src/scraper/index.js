const { fetchRss } = require('./fetchers/rss');
const { fetchHtml } = require('./fetchers/html');
const { fetchReddit } = require('./fetchers/reddit');
const { dedupItems } = require('./deduplicator');
const { analyzeContent } = require('./analyzer');
const supabase = require('../config/supabase');

async function runScraper(passedRunId) {
  const runId = passedRunId || `run_${Date.now()}`;
  const startTime = new Date();
  let totalItemsFetched = 0;
  let totalTrendsCreated = 0;

  try {
    console.log(`[${runId}] Starting scraper run...`);

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
      return { runId, success: true, itemsFetched: 0, trendsCreated: 0, storedTrends: [] };
    }

    console.log(`[${runId}] Fetched ${allItems.length} total items`);

    // Deduplicate
    const uniqueItems = await dedupItems(allItems);
    console.log(`[${runId}] Deduplicated to ${uniqueItems.length} unique items`);

    // Analyze with Claude
    const analyzedTrends = await analyzeContent(uniqueItems);
    console.log(`[${runId}] Analyzed ${analyzedTrends.length} trends`);

    // Store trends and auto-score
    totalTrendsCreated = await storeAnalyzedTrends(analyzedTrends, runId);

    console.log(`[${runId}] Scraper completed successfully`);
    return { runId, success: true, itemsFetched: totalItemsFetched, trendsCreated: totalTrendsCreated, storedTrends: analyzedTrends };
  } catch (error) {
    console.error(`[${runId}] Scraper failed:`, error.message);
    throw error;
  }
}

async function storeAnalyzedTrends(trends, runId) {
  let createdCount = 0;
  const { scoreTrend } = require('../services/radScorer');

  for (const trend of trends) {
    try {
      const { rows } = await supabase.query(
        `INSERT INTO trends (title, source, source_url, description, category, angles, happening, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (source_url) DO NOTHING
         RETURNING id`,
        [
          trend.title,
          trend.source,
          trend.source_url,
          trend.description,
          trend.category,
          JSON.stringify(trend.angles || []),
          'active',
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
