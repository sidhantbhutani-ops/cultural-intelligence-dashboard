const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data, error } = await supabase
    .from('trends')
    .select('title, source, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(t => {
      const date = new Date(t.created_at);
      console.log(`${date.toISOString().split('T')[0]} | ${t.source} | ${t.title.substring(0, 60)}`);
    });
  }
  process.exit(0);
})();
