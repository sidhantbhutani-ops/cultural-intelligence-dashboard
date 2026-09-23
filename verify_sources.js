const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_sources')
    .select('name, base_url, scrape_strategy, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total active sources: ${data.length}\n`);
    data.forEach(s => {
      console.log(`✓ ${s.name}`);
    });
  }
  process.exit(0);
})();
