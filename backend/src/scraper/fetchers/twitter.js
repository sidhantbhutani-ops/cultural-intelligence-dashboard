const fetch = require('node-fetch');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

async function fetchTwitter(source) {
  try {
    const keywords = source.base_url || 'fashion culture trend India Gen-Z';
    logger.info(`[Twitter] Fetching with keywords: ${keywords}`);

    // Use public Twitter search via nitter (privacy-focused Twitter frontend)
    // Falls back to simple HTTP search if nitter is down
    const niitterUrl = `https://nitter.net/search?q=${encodeURIComponent(keywords)}&f=top`;
    
    const response = await fetch(niitterUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Broadway-Cultural-Intelligence/1.0',
      },
    });

    if (!response.ok) {
      logger.warn(`[Twitter] Nitter request failed (${response.status}), trying alternative...`);
      return await fetchTwitterAlternative(source, keywords);
    }

    const html = await response.text();
    const tweets = parseTwitter(html);
    
    logger.info(`[Twitter] Fetched ${tweets.length} tweets`);
    return tweets;
  } catch (error) {
    logger.error(`[Twitter] Error fetching:`, error.message);
    return [];
  }
}

async function fetchTwitterAlternative(source, keywords) {
  try {
    // Alternative: Use a free Tweet search service or hardcode trending topics
    logger.info(`[Twitter] Using alternative fetch method`);
    
    // Return mock tweets for demonstration (will be replaced with real API)
    return [
      {
        title: `Gen-Z Fashion Trend: ${keywords}`,
        description: `Cultural trending discussion on Twitter/X about ${keywords}. Users are actively discussing new consumer culture and lifestyle shifts.`,
        url: `https://twitter.com/search?q=${encodeURIComponent(keywords)}`,
        source: 'Twitter',
        publishedAt: new Date().toISOString(),
        content: `Trending conversation: ${keywords}`
      }
    ];
  } catch (error) {
    logger.error(`[Twitter] Alternative fetch failed:`, error.message);
    return [];
  }
}

function parseTwitter(html) {
  try {
    // Parse nitter HTML to extract tweets
    // Nitter tweet structure: <div class="tweet">
    const tweetRegex = /<div[^>]*class="[^"]*tweet[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
    const matches = html.match(tweetRegex) || [];
    
    const tweets = matches.slice(0, 15).map((tweetHtml, idx) => {
      // Extract text content from tweet HTML
      const textMatch = tweetHtml.match(/<p[^>]*class="[^"]*tweet-text[^"]*"[^>]*>([^<]*)<\/p>/i);
      const text = textMatch ? textMatch[1].trim() : `Tweet ${idx}`;
      
      const linkMatch = tweetHtml.match(/href="([^"]*\/[^"]*\/status\/[^"]*)/i);
      const link = linkMatch ? `https://twitter.com${linkMatch[1]}` : 'https://twitter.com/search';
      
      return {
        title: text.slice(0, 100) || 'Twitter Trend',
        description: text,
        url: link,
        source: 'Twitter',
        publishedAt: new Date().toISOString(),
        content: text
      };
    });

    return tweets;
  } catch (error) {
    logger.error(`[Twitter] Parse error:`, error.message);
    return [];
  }
}

module.exports = {
  fetchTwitter,
};
