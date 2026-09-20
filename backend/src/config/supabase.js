const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    console.error(`[SQL] ${sql}`);
    console.error(`[Params] ${JSON.stringify(params)}`);
    return { rows: [], error: err };
  }
}

async function handleSelect(sql, params) {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from SELECT');
  
  if (sql.toUpperCase().includes('COUNT(*)')) {
    let qb = supabase.from(table).select('*', { count: 'exact' });
    
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:ORDER|LIMIT|RETURNING|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      qb = applyWhereConditions(qb, whereClause, params);
    }
    
    const { data, error, count } = await qb;
    if (error) throw error;
    
    return { rows: [{ count }] };
  }
  
  let qb = supabase.from(table).select('*');
  
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:ORDER|LIMIT|RETURNING|$)/i);
  if (whereMatch) {
    const whereClause = whereMatch[1].trim();
    qb = applyWhereConditions(qb, whereClause, params);
  }
  
  const orderMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/i);
  if (orderMatch) {
    const orderClause = orderMatch[1].trim();
    const orders = orderClause.split(',').map(o => o.trim());
    
    orders.forEach(order => {
      if (order.includes('DESC')) {
        const col = order.replace(/DESC/i, '').trim();
        qb = qb.order(col, { ascending: false });
      } else if (order.includes('ASC')) {
        const col = order.replace(/ASC/i, '').trim();
        qb = qb.order(col, { ascending: true });
      } else {
        qb = qb.order(order, { ascending: true });
      }
    });
  }
  
  const limitMatch = sql.match(/LIMIT\s+\$(\d+)/i);
  const offsetMatch = sql.match(/OFFSET\s+\$(\d+)/i);
  
  if (limitMatch) {
    const limitParamIndex = parseInt(limitMatch[1]) - 1;
    const offsetParamIndex = offsetMatch ? parseInt(offsetMatch[1]) - 1 : -1;
    
    const limit = params[limitParamIndex] ? parseInt(params[limitParamIndex]) : 10;
    const offset = offsetParamIndex >= 0 && params[offsetParamIndex] ? parseInt(params[offsetParamIndex]) : 0;
    
    qb = qb.range(offset, offset + limit - 1);
  }
  
  const { data, error } = await qb;
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
    if (col && col !== 'updated_at' && col !== 'CURRENT_TIMESTAMP') {
      if (pair.includes('CURRENT_TIMESTAMP')) {
        updateData[col] = new Date().toISOString();
      } else if (paramIdx < params.length) {
        updateData[col] = params[paramIdx++];
      }
    }
  });
  
  if (setClause.includes('updated_at')) {
    updateData['updated_at'] = new Date().toISOString();
  }
  
  let qb = supabase.from(table).update(updateData);
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:RETURNING|$)/i);
  if (whereMatch) {
    qb = applyWhereConditions(qb, whereMatch[1].trim(), params.slice(paramIdx));
  }
  
  const { data, error } = await qb.select();
  
  if (error) throw error;
  return { rows: data || [] };
}

async function handleDelete(sql, params) {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  if (!table) throw new Error('Could not determine table from DELETE');
  
  let qb = supabase.from(table).delete();
  const whereMatch = sql.match(/WHERE\s+(.*?)$/i);
  if (whereMatch) {
    qb = applyWhereConditions(qb, whereMatch[1].trim(), params);
  }
  
  const { data, error } = await qb.select();
  
  if (error) throw error;
  return { rows: data || [] };
}

function applyWhereConditions(qb, whereClause, params) {
  if (!whereClause || whereClause.trim() === '') return qb;
  
  const conditions = whereClause.split(/\s+AND\s+/i);
  let paramIdx = 0;
  
  conditions.forEach(condition => {
    condition = condition.trim();
    
    if (condition === '1=1' || condition === '0=0') {
      return;
    }
    
    if (condition.includes('IS NULL')) {
      const col = condition.split('IS NULL')[0].trim();
      qb = qb.is(col, null);
    } else if (condition.includes('IS NOT NULL')) {
      const col = condition.split('IS NOT NULL')[0].trim();
      qb = qb.not(col, 'is', null);
    } else if (condition.includes('ANY(')) {
      const match = condition.match(/(\w+)\s*=\s*ANY/i);
      if (match && params[paramIdx]) {
        const col = match[1];
        const values = params[paramIdx];
        qb = qb.in(col, values);
        paramIdx++;
      }
    } else if (condition.includes('ILIKE')) {
      const match = condition.match(/(\w+)\s+ILIKE/i);
      if (match && params[paramIdx]) {
        const col = match[1];
        qb = qb.ilike(col, params[paramIdx]);
        paramIdx++;
      }
    } else if (condition.includes('=')) {
      const [col] = condition.split('=').map(c => c.trim());
      if (params[paramIdx] !== undefined) {
        qb = qb.eq(col, params[paramIdx]);
        paramIdx++;
      }
    }
  });
  
  return qb;
}

module.exports = {
  supabase,
  query,
};
