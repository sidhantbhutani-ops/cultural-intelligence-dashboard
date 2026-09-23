const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  const { data } = await supabase
    .from('trends')
    .select('title, velocity_score, platform_score, novelty_score, community_score, adoption_score, category_score')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('\nLatest 3 trends with scores:\n');
  data.forEach(t => {
    const total = (t.velocity_score || 0) + (t.platform_score || 0) + (t.novelty_score || 0) + (t.community_score || 0) + (t.adoption_score || 0) + (t.category_score || 0);
    console.log(`${t.title.substring(0, 50)}`);
    console.log(`  Total: ${total}/102`);
    console.log(`  Velocity: ${t.velocity_score}, Platform: ${t.platform_score}, Novelty: ${t.novelty_score}`);
  });

  process.exit(0);
})();
