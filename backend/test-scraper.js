const { runRedditMicroScraper } = require('./src/scraper/redditMicroRunner');

runRedditMicroScraper()
  .then(r => console.log('\n✅ FINAL RESULT:', JSON.stringify(r, null, 2)))
  .catch(e => console.error('\n❌ ERROR:', e.message));
