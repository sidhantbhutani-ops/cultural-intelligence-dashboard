const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_sources')
    .select('name, base_url, scrape_strategy, is_active')
    .eq('is_active', true);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  process.exit(0);
})();
