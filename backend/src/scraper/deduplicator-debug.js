const { query } = require('../config/supabase.js');

async function isDuplicate(title, source_url, source) {
  console.log(`\n[Dedup Debug] Checking: title="${title.substring(0, 50)}..." url="${source_url.substring(0, 80)}..." source="${source}"`);
  
  try {
    const result = await query(
      `SELECT id FROM trends 
       WHERE LOWER(title) = LOWER($1) 
       AND source_url = $2 
       AND archived_at IS NULL`,
      [title, source_url]
    );

    console.log(`[Dedup Debug] Query returned ${result.rows.length} rows`);
    
    if (result.rows.length > 0) {
      console.log(`[Dedup] Found duplicate: "${title.substring(0, 50)}..." from ${source}`);
      return true;
    }

    console.log(`[Dedup Debug] ✓ NOT a duplicate`);
    return false;
  } catch (err) {
    console.error(`[Dedup] Query ERROR: ${err.message}`);
    
    try {
      const result = await query(
        `SELECT id FROM trends 
         WHERE LOWER(title) = LOWER($1) 
         AND source_url = $2 
         AND archived_at IS NULL`,
        [title, source_url]
      );
      console.log(`[Dedup Debug] Retry returned ${result.rows.length} rows`);
      return result.rows.length > 0;
    } catch (retryErr) {
      console.error(`[Dedup] Retry also failed:`, retryErr.message);
      throw retryErr;
    }
  }
}

async function dedupItems(items) {
  if (!items || items.length === 0) {
    console.log(`[Dedup] No items to deduplicate`);
    return [];
  }

  console.log(`\n[Dedup] Starting dedup on ${items.length} items from sources: ${[...new Set(items.map(i => i.source))].join(', ')}`);
  
  const unique = [];

  for (const item of items) {
    const dup = await isDuplicate(item.title, item.source_url, item.source);
    if (!dup) {
      unique.push(item);
    }
  }

  console.log(`\n[Dedup] RESULT: ${items.length} items → ${unique.length} unique\n`);
  return unique;
}

module.exports = {
  isDuplicate,
  dedupItems,
};
