const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('trends')
    .select('title, source_url')
    .eq('source', 'Hypebeast')
    .limit(3);

  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(t => {
      console.log(`Title: ${t.title}`);
      console.log(`URL: ${t.source_url}\n`);
    });
  }
  process.exit(0);
})();
