const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const toDisable = ['Fast Company', 'Scroll.in'];
  
  for (const name of toDisable) {
    await supabase
      .from('scraper_sources')
      .update({ is_active: false })
      .eq('name', name);
    console.log(`✓ Disabled: ${name}`);
  }

  process.exit(0);
})();
