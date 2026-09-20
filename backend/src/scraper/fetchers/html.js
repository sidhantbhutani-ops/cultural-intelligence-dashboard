const axios = require('axios');
const cheerio = require('cheerio');

async function fetch(source) {
  try {
    if (!source.base_url) {
      throw new Error('No base_url provided for HTML scraping');
    }

    console.log(`[HTML Fetcher] Scraping ${source.base_url}`);
    
    const response = await axios.get(source.base_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const items = [];

    // For Complex.com - scrape article cards
    if (source.base_url.includes('complex.com')) {
      $('a[href*="/a/"]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        
        if (href && title && !items.find(item => item.url === href)) {
          items.push({
            title: title.substring(0, 200),
            url: href.startsWith('http') ? href : `https://www.complex.com${href}`,
            source: source.name,
            source_url: source.base_url,
            published_at: new Date().toISOString(),
            description: ''
          });
        }
      });
    }
    
    console.log(`[HTML Fetcher] Extracted ${items.length} items from ${source.name}`);
    return items;
  } catch (err) {
    console.error(`[HTML Fetcher] Error scraping ${source.name}:`, err.message);
    throw err;
  }
}

module.exports = { fetch };
