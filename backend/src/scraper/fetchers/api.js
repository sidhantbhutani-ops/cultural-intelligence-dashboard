const fetch = require('node-fetch');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

async function fetchApi(source) {
  try {
    logger.info(`[API] Fetching from ${source.base_url}`);

    const response = await fetch(source.base_url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Broadway-Cultural-Intelligence/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const items = parseApiResponse(data, source);

    logger.info(`[API] Fetched ${items.length} items from ${source.name}`);
    return items;
  } catch (error) {
    logger.error(`[API] Error fetching ${source.name}:`, error.message);
    return [];
  }
}

function parseApiResponse(data, source) {
  try {
    let articles = [];

    // Handle different API response structures
    if (Array.isArray(data)) {
      articles = data;
    } else if (data.results && Array.isArray(data.results)) {
      articles = data.results;
    } else if (data.articles && Array.isArray(data.articles)) {
      articles = data.articles;
    } else if (data.data && Array.isArray(data.data)) {
      articles = data.data;
    } else if (data.posts && Array.isArray(data.posts)) {
      articles = data.posts;
    } else {
      throw new Error('Could not find articles array in API response');
    }

    const items = articles.slice(0, 20).map((article) => {
      // Normalize field names across different APIs
      const title = article.title || article.headline || article.name || 'Untitled';
      const description = article.description || article.excerpt || article.summary || article.content || title;
      const url = article.url || article.link || article.uri || source.base_url;
      const publishedAt = article.publishedAt || article.published_at || article.date || new Date().toISOString();

      return {
        title: title.slice(0, 200),
        description: description.slice(0, 500),
        url: url,
        source: source.name,
        publishedAt: publishedAt,
        content: `${title}\n${description}`
      };
    });

    return items;
  } catch (error) {
    logger.error(`[API] Parse error:`, error.message);
    return [];
  }
}

module.exports = {
  fetchApi,
};
