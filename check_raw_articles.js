const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  // Check raw source_urls to see what articles are stored
  const { data, error } = await supabase
    .from('trends')
    .select('source_url, created_at')
    .eq('source', 'Hypebeast')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Hypebeast URLs in DB:\n`);
    data.forEach(t => {
      const date = new Date(t.created_at);
      const slug = t.source_url.split('/').slice(-1)[0];
      console.log(`${date.toISOString().split('T')[0]} | ${slug}`);
    });
  }
  process.exit(0);
})();
