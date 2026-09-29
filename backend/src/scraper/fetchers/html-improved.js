const fetch = require('node-fetch');
const cheerio = require('cheerio');

const loggerModule = require('../../middleware/logger.js');
const logger = loggerModule.logger || loggerModule;

async function fetchHtmlImproved(source) {
  try {
    logger.info(`[HTML] Fetching from ${source.base_url}`);

    const response = await fetch(source.base_url, {
      timeout: 15000,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
      },
    });

    if (response.status === 403) {
      logger.warn(`[HTML] Got 403 (Forbidden) from ${source.name}, trying with different headers`);
      return await fetchWithRotatedHeaders(source);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items = [];
    const selectors = source.article_selector ? source.article_selector.split(',') : ['article', '.article', '[role="article"]'];
    
    for (const selector of selectors) {
      $(selector).slice(0, 20).each((idx, elem) => {
        const title = $(elem).find('h1, h2, h3, .title').text().trim();
        const description = $(elem).find('p, .description, .summary').text().trim();
        const link = $(elem).find('a').attr('href') || source.base_url;
        const fullLink = link.startsWith('http') ? link : new URL(link, source.base_url).href;
        
        if (title && description) {
          items.push({
            title: title.slice(0, 200),
            description: description.slice(0, 500),
            url: fullLink,
            source: source.name,
            publishedAt: new Date().toISOString(),
            content: `${title}\n${description}`
          });
        }
      });
    }

    logger.info(`[HTML] Fetched ${items.length} articles from ${source.name}`);
    return items.slice(0, 20);
  } catch (error) {
    logger.error(`[HTML] Error fetching ${source.name}:`, error.message);
    return [];
  }
}

async function fetchWithRotatedHeaders(source) {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
  ];

  for (const ua of userAgents) {
    try {
      const response = await fetch(source.base_url, {
        timeout: 15000,
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const items = [];
        
        $('article, .article, h2, h3').slice(0, 20).each((idx, elem) => {
          const title = $(elem).find('h1, h2, h3').text().trim() || $(elem).text().trim();
          if (title) {
            items.push({
              title: title.slice(0, 200),
              description: title,
              url: source.base_url,
              source: source.name,
              publishedAt: new Date().toISOString(),
              content: title
            });
          }
        });

        return items.slice(0, 15);
      }
    } catch (e) {
      logger.warn(`[HTML] UA ${ua.slice(0, 30)}... failed`);
      continue;
    }
  }

  return [];
}

module.exports = {
  fetchHtmlImproved,
};
