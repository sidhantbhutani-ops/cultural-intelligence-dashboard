const fetch = require('node-fetch');

async function fetchReddit(source) {
  try {
    // Extract subreddit name from base_url (e.g., "https://reddit.com/r/IndianFashionAddicts" → "IndianFashionAddicts")
    const subredditMatch = source.base_url.match(/r\/(\w+)/);
    if (!subredditMatch) {
      throw new Error(`Invalid subreddit URL: ${source.base_url}`);
    }
    const subredditName = subredditMatch[1];

    // Public Reddit JSON endpoint (no API key needed)
    const url = `https://reddit.com/r/${subredditName}/new.json?limit=30`;

    console.log(`[Reddit] Fetching r/${subredditName} from ${url}`);

    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Broadway-Cultural-Intelligence/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.data.children.map(child => child.data);

    // Transform to standard format
    const content = posts.slice(0, 30).map(post => ({
      title: post.title,
      description: post.selftext || post.title,
      source_url: `https://reddit.com${post.permalink}`,
      source: source.name,
      engagement: post.score || 0,
      created_at: new Date(post.created_utc * 1000).toISOString(),
    }));

    console.log(`[Reddit] Fetched ${content.length} posts from r/${subredditName}`);
    return content;
  } catch (error) {
    console.error(`[Reddit] Error fetching ${source.name}:`, error.message);
    return [];
  }
}

module.exports = {
  fetchReddit,
};
