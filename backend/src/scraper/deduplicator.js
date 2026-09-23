const { supabase } = require('../config/supabase.js');

async function isDuplicate(title, source_url, source) {
  try {
    // Use .ilike() instead of LOWER() for case-insensitive matching
    const { data, error } = await supabase
      .from('trends')
      .select('id')
      .ilike('title', title)
      .eq('source_url', source_url)
      .is('archived_at', null);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[Dedup] Found duplicate: "${title.substring(0, 50)}..." from ${source}`);
      return true;
    }

    return false;
  } catch (err) {
    console.warn(`[Dedup] Duplicate check failed: ${err.message}`);
    return false;
  }
}

async function dedupItems(items) {
  if (!items || items.length === 0) {
    return [];
  }

  const unique = [];

  for (const item of items) {
    const dup = await isDuplicate(item.title, item.source_url, item.source);
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
