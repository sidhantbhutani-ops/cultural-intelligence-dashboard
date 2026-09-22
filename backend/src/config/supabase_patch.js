// Add this function to src/config/supabase.js (after handleDelete)

async function handleAlter(sql, params) {
  // For ALTER TABLE, we need to use Supabase admin API directly
  // Since Supabase REST client doesn't support DDL, we'll use raw SQL via rpc
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql_query: sql 
  });
  
  if (error) {
    // If rpc doesn't exist, try direct query as fallback
    console.warn(`[Supabase] ALTER via RPC failed, attempting direct execution`);
    throw error;
  }
  
  return { rows: [], error: null };
}
