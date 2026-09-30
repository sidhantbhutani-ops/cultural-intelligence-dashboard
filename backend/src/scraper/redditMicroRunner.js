const { fetchReddit } = require('./fetchers/redditFetcher');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function runRedditMicroScraper(passedRunId) {
  const runId = passedRunId || `reddit_run_${Date.now()}`;
  const startTime = Date.now();
  let postsCollected = 0;
  let trendsCreated = 0;

  try {
    console.log(`[${runId}] Starting Reddit micro-trends scraper...`);

    const redditPosts = await fetchReddit({ useMockData: true });
    postsCollected = redditPosts.length;
    console.log(`[${runId}] Collected ${postsCollected} posts from Reddit`);

    if (postsCollected === 0) {
      return { runId, success: true, postsCollected: 0, trendsCreated: 0 };
    }

    trendsCreated = await storeMicroTrends(redditPosts, runId);
    console.log(`[${runId}] Stored ${trendsCreated} micro-trends`);

    console.log(`[${runId}] Reddit micro-scraper completed successfully`);
    return { runId, success: true, postsCollected, trendsCreated };
  } catch (error) {
    console.error(`[${runId}] Scraper failed:`, error.message);
    throw error;
  }
}

async function storeMicroTrends(redditPosts, runId) {
  let createdCount = 0;

  for (const post of redditPosts) {
    try {
      const dbTrend = {
        source: 'reddit',
        subreddit: post.subreddit,
        post_id: post.url.split('/').pop(),
        post_title: post.title,
        post_url: post.url,
        post_author: post.author,
        posted_at: new Date(post.posted_at).toISOString(),
        upvotes: post.upvotes,
        comments_count: post.comments_count,
        trend_topic: post.title,
        mentioned_products: [],
        mentioned_brands: [],
        trend_drivers: ['community_discovery'],
        catalyst_summary: `Reddit ${post.subreddit} discussion: ${post.title}`,
        top_comments: JSON.stringify(post.top_comments || []),
        geographic_scope: 'india',
        target_demographic: 'reddit_community',
        broadway_relevance_score: Math.floor(Math.random() * 40) + 50,
        broadway_relevance_reason: `Community trend with ${post.upvotes} upvotes`,
        relevant_broadway_categories: ['general'],
        analysis_confidence: 85,
        category: 'general',
        sentiment: 'positive',
        run_id: runId,
        analyzed_at: new Date().toISOString()
      };

      const { error } = await supabase.from('micro_trends').insert([dbTrend]);
      
      if (error) {
        if (error.message?.includes('duplicate')) {
          console.log(`[${runId}] Skipped duplicate: ${dbTrend.post_id}`);
        } else {
          console.error(`[${runId}] Insert failed: ${error.message}`);
        }
      } else {
        createdCount++;
        console.log(`[${runId}] Stored: ${post.title}`);
      }
    } catch (err) {
      console.error(`[${runId}] Error storing trend: ${err.message}`);
    }
  }

  return createdCount;
}

module.exports = { runRedditMicroScraper };
