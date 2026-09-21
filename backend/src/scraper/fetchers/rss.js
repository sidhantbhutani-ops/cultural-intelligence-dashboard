const fetch = require('node-fetch');
const xml2js = require('xml2js');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

const parser = new xml2js.Parser({
  explicitArray: true,
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
    if (parsed.rss?.channel?.[0]?.item) {
      items = parsed.rss.channel[0].item;
    } else if (parsed.feed?.[0]?.entry) {
      items = parsed.feed[0].entry;
    }

    const content = items.slice(0, 5).map((item, idx) => {
      // Debug: log the structure of item.link
      logger.info(`[RSS] ${source.name} item ${idx}: link structure = ${JSON.stringify(item.link?.slice(0, 2))}`);

      // Extract article link from item
      // item.link is an array; we want the one that's NOT the channel link
      let link = source.base_url;
      if (item.link && Array.isArray(item.link)) {
        // Find the longest link (article link) vs shortest (channel link)
        const validLinks = item.link
          .map(l => {
            if (typeof l === 'string') return l;
            if (l._ && typeof l._ === 'string') return l._;
            if (l.$ && l.$.href && typeof l.$.href === 'string') return l.$.href;
            return null;
          })
          .filter(l => l && l.includes('http'));
        
        if (validLinks.length > 0) {
          // Use the longest link (usually the article URL, not channel URL)
          link = validLinks.reduce((a, b) => a.length > b.length ? a : b);
        }
      }

      logger.info(`[RSS] ${source.name} item ${idx}: extracted link = ${link.substring(0, 100)}`);

      return {
        title: item.title?.[0] || '',
        description: item.description?.[0] || item.summary?.[0] || '',
        source_url: link,
        source: source.name,
        sourceId: source.id,
        pubDate: item.pubDate?.[0] || item.published?.[0],
        rawContent: JSON.stringify(item),
      };
    });

    logger.info(`[RSS] ${source.name}: parsed ${content.length} items`);
    return content;
  } catch (err) {
    logger.error(`[RSS] ${source.name} failed: ${err.message}`);
    throw err;
  }
}

module.exports = {
  fetchRss,
};
