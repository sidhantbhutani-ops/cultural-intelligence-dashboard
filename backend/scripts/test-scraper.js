const scraper = require('../src/scraper/index.js');

(async () => {
  try {
    console.log('[Test] Starting scraper test run...');
    const result = await scraper.run();
    
    console.log('[Test] ========================================');
    console.log('[Test] TEST RESULT:');
    console.log('[Test] ' + JSON.stringify(result, null, 2));
    console.log('[Test] ========================================');
    
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    console.error(`[Test] Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
})();
