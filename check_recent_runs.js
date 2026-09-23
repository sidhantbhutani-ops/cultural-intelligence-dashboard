const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data } = await supabase
    .from('scraper_logs')
    .select('run_id, status, trends_found, trends_created, duration_seconds, error_message, started_at, sources_scraped')
    .order('started_at', { ascending: false })
    .limit(10);

  console.log(`\n📋 Last 10 Scraper Runs:\n`);
  console.log(`${'Run ID'.padEnd(20)} | Trends | Created | Duration | Status | Error`);
  console.log(`${'-'.repeat(20)}-+---------+---------+----------+--------+----------`);
  
  data.forEach(log => {
    const date = new Date(log.started_at).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const error = log.error_message ? log.error_message.substring(0, 15) : 'None';
    console.log(
      `${date.padEnd(20)} | ${String(log.trends_found).padEnd(7)} | ${String(log.trends_created).padEnd(7)} | ${String(log.duration_seconds).padEnd(8)} | ${log.status.padEnd(6)} | ${error}`
    );
  });

  process.exit(0);
})();
