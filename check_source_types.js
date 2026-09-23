const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_sources')
    .select('name, source_type, scrape_strategy')
    .eq('is_active', true);

  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(s => {
      console.log(`${s.name} | source_type: ${s.source_type} | strategy: ${s.scrape_strategy}`);
    });
  }
  process.exit(0);
})();
