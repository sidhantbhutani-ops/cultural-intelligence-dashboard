const fs = require('fs');
const path = require('path');
const { query } = require('../src/config/database');

async function runMigrations() {
  console.log('[Migrate] Starting database migrations...');

  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[Migrate] No migration files found');
    process.exit(0);
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      console.log(`[Migrate] Running ${file}...`);
      await query(sql);
      console.log(`[Migrate] ✓ ${file} completed`);
    } catch (error) {
      console.error(`[Migrate] ✗ ${file} failed:`, error.message);
      process.exit(1);
    }
  }

  console.log('[Migrate] All migrations completed successfully');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('[Migrate] Fatal error:', err);
  process.exit(1);
});
