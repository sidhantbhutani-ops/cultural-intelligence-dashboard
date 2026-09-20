const { query } = require('../config/supabase.js');
const { v4: uuidv4 } = require('uuid');
const { fetch: fetchRSS } = require('./fetchers/rss.js');
const { fetch: fetchNews } = require('./fetchers/news.js');
const { analyzeContent } = require('./analyzer.js');
const { dedupItems } = require('./deduplicator.js');
const { storeAnalyzedTrends } = require('./analyzer.js');
const { clusterArticles, calculateSignalStrength } = require('./clustering.js');

class ScraperOrchestrator {
  async loadSources() {
    try {
      const result = await query('SELECT * FROM scraper_sources WHERE is_active = true');
      console.log(`[DB Query] Executed in ${Date.now()} ms`);
      return result.rows;
    } catch (err) {
      console.error(`[Scraper] Failed to load sources: ${err.message}`);
      throw err;
    }
  }

  async fetchSourceContent(source) {
    try {
      let fetcher;
      // Accept both 'rss' and 'rss_feed'
      if (source.scrape_strategy === 'rss' || source.scrape_strategy === 'rss_feed') {
        fetcher = fetchRSS;
      } else if (source.scrape_strategy === 'news' || source.scrape_strategy === 'api') {
        fetcher = fetchNews;
      } else if (source.scrape_strategy === 'html') {
        const { fetch: fetchHTML } = require('./fetchers/html.js');
        fetcher = fetchHTML;
      } else {
        console.log(`[Scraper] No fetcher for strategy: ${source.scrape_strategy}`);
        return [];
      }

      console.log(`[Scraper] Fetching ${source.name}...`);
      return new Promise((resolve, reject) => {
        fetcher(source)
          .then(items => {
            console.log(`[Scraper] ✅ ${source.name} fetched ${items.length} items`);
            resolve(items);
          })
          .catch(err => {
            console.log(`[Scraper] ❌ ${source.name} failed: ${err.message}`);
            reject(err);
          });
        setTimeout(() => reject(new Error('Fetch timeout')), 30000);
      });
    } catch (err) {
      console.error(`[Scraper] Fetch error for ${source.name}: ${err.message}`);
      throw err;
    }
  }

  async run(providedRunId) {
    const startTime = Date.now();
    const runId = providedRunId || `run-${uuidv4()}`;

    try {
      const sources = await this.loadSources();
      console.log(`[Scraper] Loaded ${sources.length} active sources`);

      const promises = sources.map(source =>
        this.fetchSourceContent(source).catch(err => {
          console.error(`[Scraper] Source ${source.name} failed`, err);
          return null;
        })
      );

      const allContent = await Promise.all(promises);
      const fetchedCount = allContent.filter(c => c !== null).length;

      const allItems = allContent
        .filter(c => c !== null)
        .flat();
      
      console.log(`[Scraper] Total items fetched: ${allItems.length}`);

      if (allItems.length === 0) {
        console.warn('[Scraper] No items fetched from any source');
        await this.logRun(runId, 'completed', 0, 0, 0, 'No items fetched', Date.now() - startTime, 0);
        return { success: true, storedTrends: [], duration: Date.now() - startTime };
      }

      console.log(`[Scraper] Deduplicating ${allItems.length} items...`);
      const uniqueItems = await dedupItems(allItems);

      if (uniqueItems.length === 0) {
        console.info('[Scraper] All items were duplicates');
        await this.logRun(runId, 'completed', allItems.length, 0, 0, 'All duplicates', Date.now() - startTime, 0);
        return { success: true, storedTrends: [], duration: Date.now() - startTime };
      }

      console.log(`[Scraper] Clustering ${uniqueItems.length} unique items...`);
      const clusters = await clusterArticles(uniqueItems);
      const topicsFound = clusters.length;

      if (clusters.length === 0) {
        console.warn('[Scraper] No clusters formed from unique items');
        await this.logRun(runId, 'completed', allItems.length, 0, uniqueItems.length, 'No clusters formed', Date.now() - startTime, 0);
        return { success: true, storedTrends: [], duration: Date.now() - startTime };
      }

      console.log(`[Scraper] Analyzing ${clusters.length} topics with Claude...`);
      const analyzedTrends = await analyzeContent(uniqueItems);

      if (analyzedTrends.length === 0) {
        console.warn('[Scraper] No trends were successfully analyzed');
        await this.logRun(runId, 'completed', allItems.length, 0, uniqueItems.length, 'No trends analyzed', Date.now() - startTime, topicsFound);
        return { success: true, storedTrends: [], duration: Date.now() - startTime };
      }

      console.log(`[Scraper] Enriching ${analyzedTrends.length} trends with clustering data...`);
      const enrichedTrends = analyzedTrends.map(trend => {
        // Find matching cluster for this trend
        const matchingCluster = clusters.find(cluster => 
          cluster.articles.some(article => article.title.toLowerCase().includes(trend.title.toLowerCase().substring(0, 30)))
        );

        if (matchingCluster) {
          return {
            ...trend,
            source_count: matchingCluster.sources.size,
            signal_strength: calculateSignalStrength(matchingCluster.sources.size),
            source_names: Array.from(matchingCluster.sources)
          };
        }

        return {
          ...trend,
          source_count: 1,
          signal_strength: 3,
          source_names: [trend.source]
        };
      });

      console.log(`[Scraper] Storing ${enrichedTrends.length} trends to database...`);
      const storedTrends = await storeAnalyzedTrends(enrichedTrends);

      const duration = Date.now() - startTime;
      console.log(`[Scraper] ========================================`);
      console.log(`[Scraper] ✅ RUN COMPLETE`);
      console.log(`[Scraper] Duration: ${duration}ms`);
      console.log(`[Scraper] Sources fetched: ${fetchedCount}/${sources.length}`);
      console.log(`[Scraper] Items fetched: ${allItems.length}`);
      console.log(`[Scraper] Unique items: ${uniqueItems.length}`);
      console.log(`[Scraper] Topics found: ${topicsFound}`);
      console.log(`[Scraper] Trends analyzed: ${analyzedTrends.length}`);
      console.log(`[Scraper] Trends stored: ${storedTrends.length}`);
      console.log(`[Scraper] ========================================`);

      await this.logRun(runId, 'completed', allItems.length, storedTrends.length, uniqueItems.length - storedTrends.length, null, duration, topicsFound);

      return {
        success: true,
        sourcesFetched: fetchedCount,
        itemsFetched: allItems.length,
        uniqueItems: uniqueItems.length,
        topicsFound,
        trendsAnalyzed: analyzedTrends.length,
        trendsCreated: storedTrends.length,
        storedTrends,
        duration,
      };
    } catch (err) {
      console.error(`[Scraper] ❌ Run failed: ${err.message}`);
      const duration = Date.now() - startTime;
      await this.logRun(runId, 'failed', 0, 0, 0, err.message, duration, 0);
      return { success: false, error: err.message, duration };
    }
  }

  async logRun(runId, status, itemsFetched, trendsCreated, trendsSkipped, errorMessage, durationMs, topicsFound) {
    try {
      await query(
        `INSERT INTO scraper_logs 
         (run_id, status, trends_found, trends_created, trends_skipped, error_message, duration_seconds, started_at, completed_at, sources_scraped, triggered_by, topics_found)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, $10)`,
        [runId, status, itemsFetched, trendsCreated, trendsSkipped, errorMessage, Math.ceil(durationMs / 1000), ['rss', 'news'], 'api', topicsFound]
      );
    } catch (err) {
      console.error(`[Scraper] Failed to log run: ${err.message}`);
    }
  }
}

module.exports = new ScraperOrchestrator();
