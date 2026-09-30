/**
 * redditMicroRunner.js
 * Main orchestrator for Reddit micro-trends scraping
 * Fetches posts from 9 Indian subreddits every 3 hours
 * Analyzes with Claude, stores in micro_trends table
 */

const { createClient } = require("@supabase/supabase-js");
const { fetchRedditPosts } = require("./fetchers/redditFetcher");
const { analyzeBatch } = require("./redditAnalyzer");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Use official Supabase SDK directly (query wrapper doesn't support .from())
const supabase = createClient(supabaseUrl, supabaseKey);

const MONITORED_SUBREDDITS = [
  "IndianMakeupAddicts",
  "IndianFashion",
  "Sneakers",
  "SkincareAddiction",
  "IndianFashionAddicts",
  "streetwear",
  "IndianBeauty",
  "FitnessIndia",
  "India",
];

/**
 * Main runner function
 * 1. Fetch posts from Reddit
 * 2. Analyze with Claude
 * 3. Store in micro_trends table
 */
async function runRedditMicroScraper() {
  console.log("\n🚀 Starting Reddit Micro-Trends Scraper...");
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📡 Monitoring ${MONITORED_SUBREDDITS.length} subreddits\n`);

  try {
    // Step 1: Fetch posts from all subreddits
    console.log("📥 Step 1: Fetching Reddit posts...");
    const allPosts = [];
    const seenPostIds = new Set();

    for (const subreddit of MONITORED_SUBREDDITS) {
      const posts = await fetchRedditPosts(subreddit, 5);
      
      // Deduplicate by post_id
      for (const post of posts) {
        if (!seenPostIds.has(post.post_id)) {
          allPosts.push(post);
          seenPostIds.add(post.post_id);
        }
      }
      
      console.log(`  ✓ r/${subreddit}: ${posts.length} posts fetched (${seenPostIds.size} unique so far)`);
    }

    console.log(`\n✅ Total unique posts fetched: ${allPosts.length}\n`);

    if (allPosts.length === 0) {
      console.log("⚠️  No posts to analyze. Exiting.");
      return {
        success: true,
        message: "No posts found",
        posts_processed: 0,
      };
    }

    // Step 2: Analyze posts with Claude
    console.log("🤖 Step 2: Analyzing with Claude...\n");
    const analyses = await analyzeBatch(allPosts);

    console.log(`\n✅ Analysis complete\n`);

    // Step 3: Store in database
    console.log("💾 Step 3: Storing in Supabase...");

    const runId = generateRunId();
    const now = new Date().toISOString();
    const recordsToInsert = [];

    for (let i = 0; i < allPosts.length; i++) {
      const post = allPosts[i];
      const analysis = analyses[i].analysis.data;

      const record = {
        source: "reddit",
        subreddit: post.subreddit,
        post_id: post.post_id,
        post_title: post.post_title,
        post_url: post.post_url,
        post_author: post.post_author || "unknown",
        posted_at: post.posted_at,
        upvotes: post.upvotes,
        comments_count: post.comments_count,
        trend_topic: extractTopic(post.post_title),
        mentioned_products: post.mentioned_products || [],
        mentioned_brands: post.mentioned_brands || [],
        trend_drivers: post.trend_drivers || [],
        catalyst_summary: analysis.catalyst_summary,
        top_comments: post.top_comments || [],
        geographic_scope: "India",
        broadway_relevance_score: analysis.broadway_relevance_score,
        broadway_relevance_reason: analysis.broadway_relevance_reason,
        relevant_broadway_categories: analysis.relevant_broadway_categories,
        analysis_confidence: analysis.analysis_confidence,
        category: inferCategory(analysis.relevant_broadway_categories),
        sentiment: analysis.sentiment,
        run_id: runId,
        analyzed_at: now,
      };

      recordsToInsert.push(record);
    }

    // Upsert: insert or update if post_id already exists
    const { data, error } = await supabase
      .from("micro_trends")
      .upsert(recordsToInsert, { onConflict: "post_id" });

    if (error) {
      console.error("❌ Database error:", error.message);
      return {
        success: false,
        error: error.message,
        posts_processed: 0,
      };
    }

    console.log(`✅ Successfully stored/updated ${recordsToInsert.length} records`);

    // Summary
    const summary = {
      success: true,
      timestamp: now,
      run_id: runId,
      posts_fetched: allPosts.length,
      posts_analyzed: recordsToInsert.length,
      subreddits_scanned: MONITORED_SUBREDDITS.length,
      analysis_breakdown: {
        high_relevance: recordsToInsert.filter(
          (r) => r.broadway_relevance_score >= 70
        ).length,
        medium_relevance: recordsToInsert.filter(
          (r) =>
            r.broadway_relevance_score >= 40 && r.broadway_relevance_score < 70
        ).length,
        low_relevance: recordsToInsert.filter(
          (r) => r.broadway_relevance_score < 40
        ).length,
      },
    };

    console.log("\n📊 Run Summary:");
    console.log(JSON.stringify(summary, null, 2));

    return summary;
  } catch (error) {
    console.error("\n❌ Scraper failed:", error.message);
    return {
      success: false,
      error: error.message,
      posts_processed: 0,
    };
  }
}

/**
 * Generate unique run ID
 */
function generateRunId() {
  return `reddit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract topic from post title (first 3-5 words)
 */
function extractTopic(title) {
  return title.split(" ").slice(0, 4).join(" ");
}

/**
 * Infer primary category from analysis categories
 */
function inferCategory(categories) {
  if (!categories || categories.length === 0) return "general";

  const priorityMap = {
    beauty: 1,
    fashion: 2,
    wellness: 3,
    lifestyle: 4,
    streetwear: 5,
    footwear: 6,
    lab_grown_diamonds: 7,
    general: 8,
  };

  return categories.sort(
    (a, b) => (priorityMap[a] || 9) - (priorityMap[b] || 9)
  )[0];
}

module.exports = {
  runRedditMicroScraper,
  MONITORED_SUBREDDITS,
};
