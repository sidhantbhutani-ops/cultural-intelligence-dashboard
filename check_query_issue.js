const { query } = require('./backend/src/config/supabase.js');

(async () => {
  // Run the EXACT query the deduplicator runs
  const title = "She's 28, Loves God and Her Family, and Might Be the Future of Fertility";
  const source_url = "https://www.wired.com/story/emma-waters-fertility-tech/";
  
  const result = await query(
    `SELECT id, title, source_url FROM trends 
     WHERE LOWER(title) = LOWER($1) 
     AND source_url = $2 
     AND archived_at IS NULL`,
    [title, source_url]
  );

  console.log(`\nQuery result for title: "${title}"`);
  console.log(`URL: ${source_url}`);
  console.log(`\nRows returned: ${result.rows.length}`);
  
  if (result.rows.length > 0) {
    console.log('\nFirst 3 rows:');
    result.rows.slice(0, 3).forEach((row, i) => {
      console.log(`  ${i+1}. ID: ${row.id}, Title: ${row.title.substring(0, 50)}, URL: ${row.source_url.substring(0, 60)}`);
    });
  }

  process.exit(0);
})();
