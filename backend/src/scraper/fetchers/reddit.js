const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

async function fetchReddit(source) {
  try {
    console.log(`[Reddit] Fetching ${source.name} from ${source.base_url}`);

    // Extract subreddit name from base_url (e.g., "IndianFashionAddicts")
    const subredditMatch = source.base_url.match(/r\/(\w+)/);
    if (!subredditMatch) {
      throw new Error(`Invalid subreddit URL: ${source.base_url}`);
    }
    const subredditName = subredditMatch[1];

    // Run Apify Reddit scraper actor
    const run = await client.actor('quacker/reddit-scraper').call({
      subreddit: subredditName,
      limit: 30, // Fetch 30 posts per subreddit
      sort: 'new', // Get newest posts
    });

    // Get dataset results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Transform to standard format
    const posts = items.map(post => ({
      title: post.title,
      description: post.selftext || post.title,
      source_url: `https://reddit.com${post.permalink}`,
      source: source.name,
      engagement: post.score || 0,
      created_at: new Date(post.created_utc * 1000).toISOString(),
    }));

    console.log(`[Reddit] Fetched ${posts.length} posts from r/${subredditName}`);
    return posts;
  } catch (error) {
    console.error(`[Reddit] Error fetching ${source.name}:`, error.message);
    return [];
  }
}

module.exports = { fetchReddit };
