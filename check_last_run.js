const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data: logs } = await supabase
    .from('scraper_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (logs && logs[0]) {
    const log = logs[0];
    console.log(`\n📋 Last Scraper Run:\n`);
    console.log(`Run ID: ${log.run_id}`);
    console.log(`Status: ${log.status}`);
    console.log(`Items Fetched: ${log.trends_found}`);
    console.log(`Trends Created: ${log.trends_created}`);
    console.log(`Trends Skipped: ${log.trends_skipped}`);
    console.log(`Duration: ${log.duration_seconds}s`);
    if (log.error_message) {
      console.log(`Error: ${log.error_message}`);
    }
    console.log(`Time: ${new Date(log.completed_at).toLocaleString()}\n`);
  }

  process.exit(0);
})();
