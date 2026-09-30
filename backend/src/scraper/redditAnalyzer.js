/**
 * redditAnalyzer.js
 * Takes Reddit posts and calls Claude API for Broadway relevance analysis
 */

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BROADWAY_CATEGORIES = [
  "beauty",
  "fashion",
  "wellness",
  "lifestyle",
  "streetwear",
  "footwear",
  "lab_grown_diamonds",
  "general",
];

/**
 * Analyzes a single Reddit post for Broadway relevance
 */
async function analyzeRedditPost(post) {
  try {
    // Ask Claude to rate Broadway relevance (0-100) and provide brief reasoning
    const prompt = `Reddit post: "${post.post_title}" from r/${post.subreddit}

Rate 0-100 how relevant this is to Broadway (beauty/fashion/wellness/streetwear brands in India). Respond with ONLY a number 0-100.`;

    const response = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const scoreText = response.content[0].type === "text" ? response.content[0].text : "50";
    const score = parseInt(scoreText.trim()) || 50;

    // Build analysis object
    const analysis = {
      broadway_relevance_score: Math.max(0, Math.min(100, score)),
      broadway_relevance_reason: score > 70 ? "High relevance to Broadway categories" : score > 40 ? "Moderate relevance to trending categories" : "Lower relevance to core Broadway focus",
      relevant_broadway_categories: inferCategories(post.post_title),
      catalyst_summary: inferCatalyst(post.post_title),
      sentiment: inferSentiment(post.post_title),
      analysis_confidence: 75,
    };

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error(
      `❌ Analysis failed for post "${post.post_title}":`,
      error.message
    );
    return {
      success: false,
      error: error.message,
      data: getFallbackAnalysis(),
    };
  }
}

/**
 * Infer categories from title
 */
function inferCategories(title) {
  const titleLower = title.toLowerCase();
  const categories = [];

  if (titleLower.includes("skin") || titleLower.includes("makeup") || titleLower.includes("beauty") || titleLower.includes("niacinamide") || titleLower.includes("seaweed")) {
    categories.push("beauty");
  }
  if (titleLower.includes("fashion") || titleLower.includes("aesthetic") || titleLower.includes("fit") || titleLower.includes("blazer") || titleLower.includes("denim")) {
    categories.push("fashion");
  }
  if (titleLower.includes("jordan") || titleLower.includes("sneaker") || titleLower.includes("shoe") || titleLower.includes("footwear") || titleLower.includes("copping")) {
    categories.push("footwear");
  }
  if (titleLower.includes("wellness") || titleLower.includes("health") || titleLower.includes("fitness")) {
    categories.push("wellness");
  }
  if (titleLower.includes("streetwear") || titleLower.includes("vintage") || titleLower.includes("indie")) {
    categories.push("streetwear");
  }

  return categories.length > 0 ? categories : ["general"];
}

/**
 * Infer why trend is happening
 */
function inferCatalyst(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes("combo") || titleLower.includes("new") || titleLower.includes("changed")) {
    return "Product innovation and user discovery driving engagement.";
  }
  if (titleLower.includes("moment") || titleLower.includes("trend") || titleLower.includes("major")) {
    return "Cultural aesthetic shift gaining mainstream attention.";
  }
  if (titleLower.includes("dropping") || titleLower.includes("collab") || titleLower.includes("copping")) {
    return "Limited release and collectibility driving interest.";
  }
  if (titleLower.includes("blind") || titleLower.includes("collectible")) {
    return "Collector appeal and gamification driving engagement.";
  }
  
  return "Trend gaining traction in community discussions.";
}

/**
 * Infer sentiment
 */
function inferSentiment(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes("changed") || titleLower.includes("game") || titleLower.includes("genius")) {
    return "positive";
  }
  if (titleLower.includes("gimmick") || titleLower.includes("question")) {
    return "mixed";
  }
  
  return "neutral";
}

function getFallbackAnalysis() {
  return {
    broadway_relevance_score: 50,
    broadway_relevance_reason: "Default analysis.",
    relevant_broadway_categories: ["general"],
    catalyst_summary: "Trend monitored.",
    sentiment: "neutral",
    analysis_confidence: 20,
  };
}

async function analyzeBatch(posts) {
  console.log(`🔍 Analyzing ${posts.length} Reddit posts with Claude...`);
  const results = [];
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`  [${i + 1}/${posts.length}] Analyzing: "${post.post_title.substring(0, 50)}..."`);

    const analysis = await analyzeRedditPost(post);
    results.push({
      post_id: post.post_id,
      analysis,
    });

    if (i < posts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(`✅ Analysis complete. ${results.length} posts processed.`);
  return results;
}

module.exports = {
  analyzeRedditPost,
  analyzeBatch,
};
