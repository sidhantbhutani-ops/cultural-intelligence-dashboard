const fetch = require('node-fetch');
const xml2js = require('xml2js');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: false,
});

async function fetchRss(source) {
  try {
    const feedUrl = source.base_url.endsWith('.com')
      ? `${source.base_url}/feed`
      : source.base_url;

    logger.info(`[RSS] Fetching from ${feedUrl}`);

    const response = await fetch(feedUrl, {
      timeout: 10000,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Broadway-Cultural-Intelligence/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const parsed = await parser.parseStringPromise(xml);

    // Get items array from RSS or Atom feed
    let items = [];
    if (parsed.rss?.channel?.item) {
      items = Array.isArray(parsed.rss.channel.item) 
        ? parsed.rss.channel.item 
        : [parsed.rss.channel.item];
    } else if (parsed.feed?.entry) {
      items = Array.isArray(parsed.feed.entry) 
        ? parsed.feed.entry 
        : [parsed.feed.entry];
    }

    const content = items.slice(0, 5).map((item, idx) => {
      // Extract article link (not channel link)
      const link = item.link?.[0] || item.link || null;
      
      if (!link) {
        logger.warn(`[RSS] ${source.name} item ${idx}: No link found`);
      }

      return {
        title: item.title?.[0] || item.title || '',
        description: item.description?.[0] || item.description || item.summary?.[0] || '',
        source_url: link || source.base_url,
        source: source.name,
        sourceId: source.id,
        pubDate: item.pubDate?.[0] || item.pubDate || item.published?.[0] || item.published,
        rawContent: JSON.stringify(item),
      };
    });

    logger.info(`[RSS] ${source.name}: parsed ${content.length} items`);
    content.forEach((item, i) => {
      logger.debug(`[RSS] ${source.name} item ${i}: ${item.title.substring(0, 50)} -> ${item.source_url.substring(0, 100)}`);
    });

    return content;
  } catch (err) {
    logger.error(`[RSS] ${source.name} failed: ${err.message}`);
    throw err;
  }
}

module.exports = {
  fetchRss,
};
