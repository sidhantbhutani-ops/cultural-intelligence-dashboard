const supabase = require('./backend/src/config/supabase.js').supabase;

(async () => {
  // First check if table has any data
  const { data: trends, error: trendsError } = await supabase
    .from('trends')
    .select('id, title')
    .limit(1);

  if (trendsError) {
    console.error('Query error:', trendsError);
    process.exit(1);
  }

  if (!trends || trends.length === 0) {
    console.log('No trends in database yet');
    process.exit(0);
  }

  // Try to select coverage_sources
  const { data, error } = await supabase
    .from('trends')
    .select('title, coverage_sources')
    .limit(1);

  if (error) {
    console.error('Error selecting coverage_sources:', error.message);
    console.log('\nThe column might not exist in the database yet.');
    console.log('The scraper needs to run and create new trends with the updated schema.');
  } else {
    console.log('coverage_sources column exists!');
    console.log('Sample:', JSON.stringify(data[0], null, 2));
  }

  process.exit(0);
})();
