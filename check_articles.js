const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('trends')
    .select('title, source, source_url, created_at')
    .eq('source', 'Hypebeast')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Recent Hypebeast trends in DB:\n`);
    data.forEach(t => {
      const date = new Date(t.created_at);
      console.log(`${date.toISOString()} | ${t.title.substring(0, 60)}`);
      console.log(`  URL: ${t.source_url.substring(0, 80)}\n`);
    });
  }
  process.exit(0);
})();
