const fetch = require('node-fetch');
const xml2js = require('xml2js');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

const parser = new xml2js.Parser({
  explicitArray: true,  // Keep as array to handle multiple links correctly
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
      // Extract article link from item (not channel link)
      // With explicitArray: true, link is an array
      let link = source.base_url;
      if (item.link && item.link.length > 0) {
        // RSS: <link>url</link> → item.link[0]._ or item.link[0]
        // Atom: <link href="url"/> → item.link[0].$.href
        if (item.link[0]._) {
          link = item.link[0]._;
        } else if (item.link[0].$ && item.link[0].$.href) {
          link = item.link[0].$.href;
        } else if (typeof item.link[0] === 'string') {
          link = item.link[0];
        }
      }

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
