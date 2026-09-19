const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Wrapper to maintain same interface as old pg query() function
 * Now returns { rows, error } for backward compatibility
 */
async function query(sql, params = []) {
  try {
    const sqlUpper = sql.toUpperCase();
    
    if (sqlUpper.includes('INSERT')) {
      return await handleInsert(sql, params);
    } else if (sqlUpper.includes('UPDATE')) {
      return await handleUpdate(sql, params);
    } else if (sqlUpper.includes('DELETE')) {
      return await handleDelete(sql, params);
    } else if (sqlUpper.includes('SELECT')) {
      return await handleSelect(sql, params);
    }
    
    throw new Error(`Unsupported SQL operation: ${sql.substring(0, 50)}`);
  } catch (err) {
    console.error(`[Supabase Query Error] ${err.message}`);
    return { rows: [], error: err };
  }
}

async function handleSelect(sql, params) {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from SELECT');
  
  let query = supabase.from(table).select('*');
  query = applyWhereConditions(query, sql, params);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return { rows: data || [] };
}

async function handleInsert(sql, params) {
  const tableMatch = sql.match(/INTO\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from INSERT');
  
  const columnsMatch = sql.match(/\((.*?)\)\s*VALUES/i);
  const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
  
  const row = {};
  let paramIdx = 0;
  
  columns.forEach((col) => {
    if (col === 'started_at' || col === 'completed_at' || col === 'created_at' || col === 'updated_at' || col === 'picked_up_at') {
      row[col] = new Date().toISOString();
    } else if (paramIdx < params.length) {
      row[col] = params[paramIdx++];
    }
  });
  
  const { data, error } = await supabase
    .from(table)
    .insert([row])
    .select();
  
  if (error) throw error;
  return { rows: data || [] };
}

async function handleUpdate(sql, params) {
  const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from UPDATE');
  
  const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
  const setClause = setMatch ? setMatch[1] : '';
  
  const updateData = {};
  const setPairs = setClause.split(',').map(p => p.trim());
  let paramIdx = 0;
  
  setPairs.forEach(pair => {
    const [col] = pair.split('=').map(p => p.trim());
    if (col && col !== 'updated_at') {
      updateData[col] = params[paramIdx++];
    }
  });
  
  if (setClause.includes('updated_at')) {
    updateData['updated_at'] = new Date().toISOString();
  }
  
  let query = supabase.from(table).update(updateData);
  query = applyWhereConditions(query, sql, params.slice(paramIdx));
  
  const { data, error } = await query.select();
  
  if (error) throw error;
  return { rows: data || [] };
}

async function handleDelete(sql, params) {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from DELETE');
  
  let query = supabase.from(table).delete();
  query = applyWhereConditions(query, sql, params);
  
  const { data, error } = await query.select();
  
  if (error) throw error;
  return { rows: data || [] };
}

function applyWhereConditions(query, sql, params) {
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:ORDER|LIMIT|RETURNING|$)/i);
  if (!whereMatch) return query;
  
  const whereClause = whereMatch[1].trim();
  const conditions = whereClause.split(/\s+AND\s+/i);
  
  let paramIdx = 0;
  
  conditions.forEach(condition => {
    condition = condition.trim();
    
    if (condition.includes('IS NULL')) {
      const col = condition.split('IS NULL')[0].trim();
      query = query.is(col, null);
    } else if (condition.includes('IS NOT NULL')) {
      const col = condition.split('IS NOT NULL')[0].trim();
      query = query.not(col, 'is', null);
    } else if (condition.includes('LOWER(') && condition.includes('LOWER(')) {
      const colMatch = condition.match(/LOWER\((\w+)\)/);
      const col = colMatch ? colMatch[1] : null;
      if (col && params[paramIdx]) {
        query = query.ilike(col, `%${params[paramIdx]}%`);
        paramIdx++;
      }
    } else if (condition.includes('=')) {
      const [col] = condition.split('=').map(c => c.trim());
      if (params[paramIdx] !== undefined) {
        query = query.eq(col, params[paramIdx]);
        paramIdx++;
      }
    } else if (condition.includes('>')) {
      const [col] = condition.split('>').map(c => c.trim());
      if (params[paramIdx] !== undefined) {
        query = query.gt(col, params[paramIdx]);
        paramIdx++;
      }
    } else if (condition.includes('<')) {
      const [col] = condition.split('<').map(c => c.trim());
      if (params[paramIdx] !== undefined) {
        query = query.lt(col, params[paramIdx]);
        paramIdx++;
      }
    }
  });
  
  return query;
}

module.exports = {
  supabase,
  query,
};
