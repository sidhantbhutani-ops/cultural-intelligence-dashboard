const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data } = await supabase
    .from('trends')
    .select('title, source, coverage_sources')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('\nLatest 3 trends with coverage:\n');
  data.forEach(t => {
    const sources = Array.isArray(t.coverage_sources) ? t.coverage_sources : JSON.parse(t.coverage_sources || '[]');
    console.log(`${t.title.substring(0, 50)}`);
    console.log(`  Primary: ${t.source}`);
    console.log(`  Coverage: ${sources.length} sources - ${sources.map(s => s.source).join(', ')}`);
  });

  process.exit(0);
})();
