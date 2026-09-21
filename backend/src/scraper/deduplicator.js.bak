const { query } = require('../config/supabase.js');

async function isDuplicate(title, source_url, source) {
  try {
    const result = await query(
      `SELECT id FROM trends 
       WHERE LOWER(title) = LOWER($1) 
       AND source_url = $2 
       AND archived_at IS NULL`,
      [title, source_url]
    );

    if (result.rows.length > 0) {
      console.log(`[Dedup] Found duplicate: "${title}" from ${source}`);
      return true;
    }

    return false;
  } catch (err) {
    console.warn(`[Dedup] Duplicate check failed: ${err.message}`);
    
    const result = await query(
      `SELECT id FROM trends 
       WHERE LOWER(title) = LOWER($1) 
       AND source_url = $2 
       AND archived_at IS NULL`,
      [title, source_url]
    );

    return result.rows.length > 0;
  }
}

async function dedupItems(items) {
  if (!items || items.length === 0) {
    return [];
  }

  const unique = [];

  for (const item of items) {
    const dup = await isDuplicate(item.title, item.url, item.source);
    if (!dup) {
      unique.push(item);
    }
  }

  console.log(`[Dedup] Filtered ${items.length} items → ${unique.length} unique`);
  return unique;
}

module.exports = {
  isDuplicate,
  dedupItems,
};
