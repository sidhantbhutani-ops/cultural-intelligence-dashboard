require('dotenv').config({ path: './backend/.env.local' });
const { query } = require('../src/config/supabase');

async function cleanup() {
  try {
    console.log('[Cleanup] Deleting all trends...');
    await query('DELETE FROM trends WHERE id IS NOT NULL');
    console.log('[Cleanup] ✅ All trends deleted');
    
    console.log('[Cleanup] Deleting all scraper logs...');
    await query('DELETE FROM scraper_logs WHERE id IS NOT NULL');
    console.log('[Cleanup] ✅ All scraper logs deleted');
    
    console.log('[Cleanup] Deleting all team actions...');
    await query('DELETE FROM team_actions WHERE id IS NOT NULL');
    console.log('[Cleanup] ✅ All team actions deleted');
    
    console.log('[Cleanup] ✅ Database cleaned. Ready for fresh scrape.');
    process.exit(0);
  } catch (err) {
    console.error('[Cleanup] ❌ Error:', err.message);
    process.exit(1);
  }
}

cleanup();
