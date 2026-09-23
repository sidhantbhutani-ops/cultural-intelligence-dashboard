const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  // Check if this EXACT URL is in the database
  const testUrl = "https://hypebeast.com/2026/9/adam-driver-miles-teller-and-scarlett-johansson-star-in-official-trailer-for-james-grays-paper-tiger";
  
  const { data, error } = await supabase
    .from('trends')
    .select('id, title, source_url')
    .eq('source_url', testUrl);

  console.log(`Checking for URL: ${testUrl}\n`);
  console.log(`Found in DB? ${data && data.length > 0}`);
  
  if (data && data.length > 0) {
    console.log(`\nMatches:`);
    data.forEach(d => console.log(`  Title: ${d.title}`));
  } else {
    console.log(`\nNo matches. This URL should NOT be a duplicate.`);
  }

  process.exit(0);
})();
