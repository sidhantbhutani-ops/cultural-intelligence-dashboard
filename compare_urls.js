const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  // Get URLs from DB
  const { data: dbData } = await supabase
    .from('trends')
    .select('source_url')
    .eq('source', 'Hypebeast')
    .limit(50);

  const dbUrls = dbData.map(d => d.source_url.split('/').slice(-1)[0]);

  console.log('URLs in DB:', dbUrls.slice(0, 5));
  console.log('\n\nURLs from current feed: (from earlier debug output)');
  const feedSlugs = [
    'adam-driver-miles-teller-and-scarlett-johansson-star-in-official-trailer-for-james-grays-paper-tiger',
    'on-targets-7-billion-as-golf-and-football-loom',
    'nike-air-force-1-low-ghostface-black-iz1207-010-official-look-release-info',
  ];
  console.log(feedSlugs.slice(0, 3));

  // Check if any match
  const matches = feedSlugs.filter(slug => dbUrls.includes(slug));
  console.log(`\n\nMatches: ${matches.length}`);
  if (matches.length > 0) {
    console.log('These URLs are ALREADY in the database:');
    matches.forEach(m => console.log(`  - ${m}`));
  }

  process.exit(0);
})();
