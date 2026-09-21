const fetch = require('node-fetch');
const xml2js = require('xml2js');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
});

async function fetchRss(source) {
  try {
    const feedUrl = source.base_url.endsWith('.com')
      ? `${source.base_url}/feed`
      : source.base_url;

    logger.info(`[RSS] Fetching from ${feedUrl}`);

    const response = await fetch(feedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Broadway-Cultural-Intelligence/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const parsed = await parser.parseStringPromise(xml);

    const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];

    const content = itemArray.slice(0, 5).map(item => ({
      title: item.title || item.summary?._,
      description: item.description || item.content?._ || item.summary?._,
      source_url: item.link?.$ ? item.link.$.href : item.link,
      source: source.name,
      sourceId: source.id,
      pubDate: item.pubDate || item.published,
      rawContent: JSON.stringify(item),
    }));

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
