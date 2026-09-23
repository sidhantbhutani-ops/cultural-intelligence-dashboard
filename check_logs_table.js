const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('scraper_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  console.log(`\nTotal rows in scraper_logs: ${data ? data.length : 0}\n`);
  
  if (data && data.length > 0) {
    console.log('Last 5 runs:');
    data.forEach((log, i) => {
      console.log(`${i+1}. ${log.run_id} - ${log.status} - ${log.trends_found} items - ${new Date(log.created_at).toLocaleString()}`);
    });
  } else {
    console.log('No logs found in database');
  }

  process.exit(0);
})();
