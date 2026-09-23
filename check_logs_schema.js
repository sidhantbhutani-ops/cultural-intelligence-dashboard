const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Query error:', error);
  } else if (data && data.length > 0) {
    console.log('\nScraper_logs columns:');
    console.log(Object.keys(data[0]));
    console.log('\nFirst row:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No rows in scraper_logs table');
  }

  process.exit(0);
})();
