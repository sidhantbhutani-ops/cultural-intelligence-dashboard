const supabase = require('../src/config/supabase');

const newSources = [
  {
    name: 'Homegrown',
    type: 'rss',
    base_url: 'https://www.homegrown.in/feed',
    scrape_strategy: 'rss',
    rate_limit: 10,
    priority: 1,
  },
  {
    name: 'UGRA India',
    type: 'rss',
    base_url: 'https://www.ugra.in/feed',
    scrape_strategy: 'rss',
    rate_limit: 10,
    priority: 1,
  },
  {
    name: 'Grazia India',
    type: 'rss',
    base_url: 'https://www.grazia.in/feed',
    scrape_strategy: 'rss',
    rate_limit: 10,
    priority: 1,
  },
  {
    name: 'Vogue India',
    type: 'rss',
    base_url: 'https://www.vogue.in/feed',
    scrape_strategy: 'rss',
    rate_limit: 10,
    priority: 1,
  },
  {
    name: 'r/IndianFashionAddicts',
    type: 'reddit',
    base_url: 'https://reddit.com/r/IndianFashionAddicts',
    scrape_strategy: 'reddit',
    rate_limit: 5,
    priority: 1,
  },
  {
    name: 'r/IndianFashion',
    type: 'reddit',
    base_url: 'https://reddit.com/r/IndianFashion',
    scrape_strategy: 'reddit',
    rate_limit: 5,
    priority: 1,
  },
  {
    name: 'r/IndianMakeupAddicts',
    type: 'reddit',
    base_url: 'https://reddit.com/r/IndianMakeupAddicts',
    scrape_strategy: 'reddit',
    rate_limit: 5,
    priority: 2,
  },
  {
    name: 'BUNA Studio',
    type: 'rss',
    base_url: 'https://www.buna.studio/feed',
    scrape_strategy: 'rss',
    rate_limit: 10,
    priority: 2,
  },
  {
    name: 'Substack Consumer Culture',
    type: 'rss',
    base_url: 'https://databutmakeitfashion.substack.com/feed',
    scrape_strategy: 'rss',
    rate_limit: 5,
    priority: 2,
  },
];

async function addSources() {
  try {
    console.log('Adding 9 Indian sources...');
    let added = 0;

    for (const source of newSources) {
      const { error } = await supabase.query(
        `INSERT INTO scraper_sources (name, type, base_url, scrape_strategy, rate_limit, priority, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (name) DO NOTHING`,
        [
          source.name,
          source.type,
          source.base_url,
          source.scrape_strategy,
          source.rate_limit,
          source.priority,
          true,
        ]
      );

      if (error) {
        console.error(`Error adding ${source.name}:`, error);
      } else {
        added++;
        console.log(`✅ Added: ${source.name}`);
      }
    }

    console.log(`\nAdded ${added} sources successfully`);
  } catch (error) {
    console.error('Failed to add sources:', error);
  }
}

addSources();
