const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data } = await supabase
    .from('scraper_sources')
    .select('id, name, is_active, last_error, last_successful_fetch, consecutive_failures')
    .eq('is_active', true)
    .order('name');

  console.log(`\n📊 Active Sources Status:\n`);
  console.log(`${'Name'.padEnd(35)} | Active | Last Error | Failures`);
  console.log(`${'-'.repeat(35)}-+---------+-----------+----------`);
  
  data.forEach(source => {
    const error = source.last_error ? source.last_error.substring(0, 20) : 'None';
    const status = source.consecutive_failures > 0 ? '❌' : '✅';
    console.log(
      `${source.name.padEnd(35)} | ${status} | ${error.padEnd(20)} | ${source.consecutive_failures}`
    );
  });

  process.exit(0);
})();
