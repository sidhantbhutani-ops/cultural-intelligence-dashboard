const logger = console;

function logScraperRun(stats) {
  const {
    sourcesFetched = 0,
    itemsFetched = 0,
    itemsDedup = 0,
    itemsAnalyzed = 0,
    trendsCreated = 0,
    duration = 0
  } = stats;

  const freshRate = itemsFetched > 0 
    ? ((itemsFetched - itemsDedup) / itemsFetched * 100).toFixed(1) 
    : 0;
  
  logger.log(`\n[SCRAPER RUN SUMMARY]`);
  logger.log(`  Sources checked: ${sourcesFetched}`);
  logger.log(`  Total items fetched: ${itemsFetched}`);
  logger.log(`  Already seen (duplicates): ${itemsDedup}`);
  logger.log(`  NEW items: ${itemsFetched - itemsDedup} (${freshRate}% fresh)`);
  logger.log(`  Analyzed: ${itemsAnalyzed}`);
  logger.log(`  Trends created: ${trendsCreated}`);
  logger.log(`  Duration: ${duration}s`);
  logger.log(`  Status: ${trendsCreated > 0 ? '✅ NEW DATA' : '⚠️ NO NEW TRENDS'}\n`);
}

module.exports = { logScraperRun };
