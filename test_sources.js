const fetch = require('node-fetch');
const xml2js = require('xml2js');

const sources = [
  { name: 'Hypebeast', url: 'https://hypebeast.com/feed' },
  { name: 'Highsnobiety', url: 'https://www.highsnobiety.com/feed/' },
  { name: 'Collab Substack', url: 'https://collab.substack.com' },
  { name: 'Consumer Culture Substack', url: 'https://databutmakeitfashion.substack.com/feed' },
  { name: 'The Business of Fashion', url: 'https://www.businessoffashion.com/feed' },
  { name: 'Fast Company', url: 'https://www.fastcompany.com/feed' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Scroll.in', url: 'https://scroll.in/feed' },
  { name: 'Outlook India', url: 'https://www.outlookindia.com/feed' },
];

(async () => {
  console.log('Testing RSS sources...\n');
  
  for (const source of sources) {
    try {
      const response = await fetch(source.url, { timeout: 5000 });
      const text = await response.text();
      
      if (text.includes('captcha') || text.includes('CAPTCHA')) {
        console.log(`❌ ${source.name} — Blocked by Cloudflare`);
      } else if (text.includes('<?xml') || text.includes('<rss') || text.includes('<feed')) {
        console.log(`✓ ${source.name} — Working`);
      } else {
        console.log(`⚠️  ${source.name} — Unexpected response (HTML/other)`);
      }
    } catch (error) {
      console.log(`❌ ${source.name} — Error: ${error.message}`);
    }
  }
  
  process.exit(0);
})();
