const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  process.exit(0);
})();
