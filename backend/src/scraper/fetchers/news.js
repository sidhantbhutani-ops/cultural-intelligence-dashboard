const fetch = require('node-fetch');
const xml2js = require('xml2js');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
});

const newsFeedMap = {
  'https://variety.com': 'https://variety.com/feed/',
  'https://pitchfork.com': 'https://pitchfork.com/feed/rss.xml',
  'https://rollingstone.com': 'https://www.rollingstone.com/feed/',
  'https://wired.com': 'https://www.wired.com/feed/rss',
  'https://designobserver.com': 'https://designobserver.com/feed/rss',
  'https://eyeondesign.aiga.org': 'https://eyeondesign.aiga.org/feed/',
  'https://www.architecturaldigestindia.com': 'https://www.architecturaldigestindia.com/feed/',
  'https://lifestyle.livemint.com': 'https://lifestyle.livemint.com/feed/rss',
  'https://cosmeticsbusiness.com': 'https://www.cosmeticsbusiness.com/news/feed',
  'https://trendwatching.com': 'https://trendwatching.com/feed/rss.xml',
};

async function fetchNews(source) {
  try {
    let feedUrl = newsFeedMap[source.base_url];
    
    if (!feedUrl) {
      feedUrl = source.base_url.endsWith('/')
        ? `${source.base_url}feed/rss`
        : `${source.base_url}/feed/rss`;
    }

    logger.info(`[News] Fetching from ${feedUrl}`);

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
      description: item.description || item['content:encoded'] || item.content?._ || item.summary?._,
      source_url: item.link?.$ ? item.link.$.href : item.link,
      source: source.name,
      sourceId: source.id,
      pubDate: item.pubDate || item.published,
      rawContent: JSON.stringify(item),
    }));

    logger.info(`[News] ${source.name}: parsed ${content.length} items`);
    return content;
  } catch (err) {
    logger.error(`[News] ${source.name} failed: ${err.message}`);
    throw err;
  }
}

module.exports = {
  fetch: fetchNews,
};
