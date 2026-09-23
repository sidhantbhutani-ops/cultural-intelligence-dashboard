const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  // Sources to disable
  const brokenSources = [
    'Homegrown',
    'UGRA India',
    'Grazia India',
    'Vogue India',
    'r/IndianFashionAddicts',
    'r/IndianFashion',
    'r/IndianMakeupAddicts',
    'BUNA Studio',
    'Fashion Forward India',
    'The Bombay Edition',
    'Untag India',
    'Indian Consumer Culture',
  ];

  // Disable broken sources
  for (const name of brokenSources) {
    const { error } = await supabase
      .from('scraper_sources')
      .update({ is_active: false })
      .eq('name', name);
    
    if (error) {
      console.error(`Failed to disable ${name}:`, error.message);
    } else {
      console.log(`✓ Disabled: ${name}`);
    }
  }

  // Add new sources
  const newSources = [
    { name: 'The Business of Fashion', base_url: 'https://www.businessoffashion.com/feed', strategy: 'rss' },
    { name: 'Fast Company', base_url: 'https://www.fastcompany.com/feed', strategy: 'rss' },
    { name: 'Wired', base_url: 'https://www.wired.com/feed/rss', strategy: 'rss' },
    { name: 'TechCrunch', base_url: 'https://techcrunch.com/feed/', strategy: 'rss' },
    { name: 'Scroll.in', base_url: 'https://scroll.in/feed', strategy: 'rss' },
    { name: 'Outlook India', base_url: 'https://www.outlookindia.com/feed', strategy: 'rss' },
  ];

  for (const source of newSources) {
    const { error } = await supabase
      .from('scraper_sources')
      .insert([{
        name: source.name,
        base_url: source.base_url,
        scrape_strategy: source.strategy,
        is_active: true,
      }]);
    
    if (error) {
      console.error(`Failed to add ${source.name}:`, error.message);
    } else {
      console.log(`✓ Added: ${source.name}`);
    }
  }

  console.log('\nDone! Now you have 10 sources: 4 original + 6 new');
  process.exit(0);
})();
