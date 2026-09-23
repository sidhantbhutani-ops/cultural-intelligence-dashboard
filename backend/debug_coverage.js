require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('trends')
    .select('id, title, coverage_sources')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  data.forEach(t => {
    console.log(`\n${t.title}`);
    console.log(`  coverage_sources: ${JSON.stringify(t.coverage_sources)}`);
  });
})();
