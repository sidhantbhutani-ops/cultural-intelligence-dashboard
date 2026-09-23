// Test: fetch from one source and see the raw items
const { fetchRss } = require('./backend/src/scraper/fetchers/rss.js');

(async () => {
  const testSource = {
    id: 1,
    name: 'Hypebeast',
    base_url: 'https://hypebeast.com/feed',
    scrape_strategy: 'rss',
  };

  const items = await fetchRss(testSource);
  console.log(`Fetched ${items.length} items from Hypebeast\n`);
  
  items.slice(0, 3).forEach((item, idx) => {
    console.log(`Item ${idx}:`);
    console.log(`  Title: ${item.title.substring(0, 80)}`);
    console.log(`  URL: ${item.source_url}`);
    console.log(`  Pub: ${item.pubDate}\n`);
  });

  process.exit(0);
})();
