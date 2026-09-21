require('dotenv').config({ path: '.env.local' });
const { query } = require('../config/supabase');

async function addSpectrumColumns() {
  try {
    console.log('[Migration] Adding SPECTRUM columns to trends table...');
    
    const columns = [
      'velocity_score',
      'platform_score',
      'novelty_score',
      'community_score',
      'adoption_score',
      'category_score'
    ];

    for (const col of columns) {
      const sql = `ALTER TABLE trends ADD COLUMN IF NOT EXISTS ${col} INTEGER DEFAULT 0`;
      console.log(`[Migration] Executing: ${sql}`);
      await query(sql, []);
      console.log(`[Migration] ✅ Column ${col} added`);
    }

    console.log('[Migration] ✅ All SPECTRUM columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] ❌ Error:', error.message);
    process.exit(1);
  }
}

addSpectrumColumns();
