const { fetchRss } = require('./fetchers/rss');
const { fetchHtml } = require('./fetchers/html');
const { fetchReddit } = require('./fetchers/reddit');
const { fetchTwitter } = require('./fetchers/twitter');
const { fetchApi } = require('./fetchers/api');
const { fetchHtmlImproved } = require('./fetchers/html-improved');
const { dedupItems } = require('./deduplicator');
const { analyzeContent } = require('./analyzer');
const supabase = require('../config/supabase');

async function runScraper(passedRunId) {
  const runId = passedRunId || `run_${Date.now()}`;
  const startTime = Date.now();
  let totalItemsFetched = 0;
  let totalTrendsCreated = 0;

  try {
    console.log(`[${runId}] Starting scraper run...`);

    const { rows: sources } = await supabase.query(
      `SELECT * FROM scraper_sources WHERE is_active = true`
    );

    if (!sources || sources.length === 0) {
      throw new Error('No active sources found');
    }

    console.log(`[${runId}] Found ${sources.length} active sources`);

    const allItems = [];
    const fetchPromises = sources.map(async (source) => {
      try {
        let items = [];

        if (source.scrape_strategy === 'rss' || source.scrape_strategy === 'rss_feed') {
          items = await fetchRss(source);
        } else if (source.scrape_strategy === 'html') {
          items = await fetchHtml(source);
        } else if (source.scrape_strategy === 'html_improved') {
          items = await fetchHtmlImproved(source);
        } else if (source.scrape_strategy === 'twitter') {
          items = await fetchTwitter(source);
        } else if (source.scrape_strategy === 'api') {
          items = await fetchApi(source);
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
      await logRun(runId, 'completed', 0, 0, 0, 'No items fetched', Date.now() - startTime);
      return { runId, success: true, itemsFetched: 0, trendsCreated: 0, storedTrends: [] };
    }

    console.log(`[${runId}] Fetched ${allItems.length} total items`);

    const uniqueItems = await dedupItems(allItems);
    console.log(`[${runId}] Deduplicated to ${uniqueItems.length} unique items`);

    if (uniqueItems.length === 0) {
      await logRun(runId, 'completed', allItems.length, 0, allItems.length, 'All duplicates', Date.now() - startTime);
      return { runId, success: true, itemsFetched: totalItemsFetched, trendsCreated: 0, storedTrends: [] };
    }

    const analyzedTrends = await analyzeContent(uniqueItems);
    console.log(`[${runId}] Analyzed ${analyzedTrends.length} trends`);

    totalTrendsCreated = await storeAnalyzedTrends(analyzedTrends, runId);

    await logRun(runId, 'completed', totalItemsFetched, totalTrendsCreated, uniqueItems.length - totalTrendsCreated, null, Date.now() - startTime);
    console.log(`[${runId}] Scraper completed successfully`);
    return { runId, success: true, itemsFetched: totalItemsFetched, trendsCreated: totalTrendsCreated, storedTrends: analyzedTrends };
  } catch (error) {
    console.error(`[${runId}] Scraper failed:`, error.message);
    await logRun(runId, 'failed', totalItemsFetched, totalTrendsCreated, 0, error.message, Date.now() - startTime);
    throw error;
  }
}

async function storeAnalyzedTrends(trends, runId) {
  let createdCount = 0;
  const dbTrends = trends.map(t => ({
    title: t.title,
    description: t.description,
    category: t.category,
    source: t.primary_source,
    source_url: t.primary_source_url,
    angles: t.angles,
    cultural_significance: t.cultural_significance,
    coverage_sources: t.coverage_article_indices,
    happening: true
  }));

  for (const trend of dbTrends) {
    try {
      const { rows } = await supabase.query(
        `INSERT INTO trends 
         (title, description, category, source, source_url, angles, cultural_significance, coverage_sources, happening, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [trend.title, trend.description, trend.category, trend.source, trend.source_url, trend.angles, trend.cultural_significance, trend.coverage_sources, trend.happening, new Date().toISOString()]
      );

      if (rows && rows.length > 0) {
        createdCount++;
        const trendId = rows[0].id;
        setTimeout(() => scoreTrend(trends.find(t => t.title === trend.title)), 100);
      }
    } catch (err) {
      if (err.message?.includes('duplicate key')) {
        console.log(`[${runId}] Skipped duplicate: ${trend.source_url}`);
      } else {
        console.error(`[${runId}] Failed to insert trend: ${err.message}`);
      }
    }
  }

  if (createdCount > 0) {
    const skippedCount = dbTrends.length - createdCount;
    console.log(`[${runId}] Created ${createdCount} trends, skipped ${skippedCount} duplicates`);
    if (skippedCount > 0) {
      console.log(`[${runId}] Skipped ${skippedCount} duplicate URLs`);
    }
  }

  return createdCount;
}

async function logRun(runId, status, itemsFetched, trendsCreated, trendsSkipped, error, durationMs) {
  try {
    const now = new Date().toISOString();
    await supabase.query(
      `INSERT INTO scraper_logs 
       (run_id, status, trends_found, trends_created, trends_skipped, error_message, duration_seconds, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [runId, status, itemsFetched, trendsCreated, trendsSkipped, error, Math.ceil(durationMs / 1000), now, now]
    );
    console.log(`[${runId}] ✅ Logged run to scraper_logs`);
  } catch (err) {
    console.error(`[${runId}] Failed to log run: ${err.message}`);
  }
}

async function scoreTrend(trend) {
  const { scoreTrend: scoreFunc } = require('../services/spectrumScorer');
  return await scoreFunc(trend);
}

module.exports = { runScraper, run: runScraper };
