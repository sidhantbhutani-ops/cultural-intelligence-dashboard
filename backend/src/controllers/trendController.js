const { query, supabase } = require('../config/supabase.js');

async function getTrends(req, res, next) {
  try {
    const { category, source, sort = 'latest', limit = 10, offset = 0, search } = req.query;

    let queryText = 'SELECT * FROM trends WHERE archived_at IS NULL';
    let params = [];
    let paramCount = 1;

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (source) {
      queryText += ` AND source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (sort === 'latest') {
      queryText += ' ORDER BY created_at DESC';
    } else if (sort === 'trending') {
      queryText += ' ORDER BY engagement_metric DESC';
    } else if (sort === 'oldest') {
      queryText += ' ORDER BY created_at ASC';
    }

    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    const trends = result.rows || [];

    const countResult = await query('SELECT COUNT(*) as count FROM trends WHERE archived_at IS NULL', []);
    const total = countResult.rows[0] ? parseInt(countResult.rows[0].count) : 0;

    res.json({
      status: 'success',
      data: trends,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_next: offset + parseInt(limit) < total,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[TrendController] getTrends error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trends',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getTrendById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM trends WHERE id = $1', [id]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Trend not found',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[TrendController] getTrendById error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trend',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getArchive(req, res, next) {
  try {
    const { search, category, limit = 20, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM trends WHERE archived_at IS NOT NULL';
    let params = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    queryText += ` ORDER BY archived_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    const trends = result.rows || [];

    res.json({
      status: 'success',
      data: trends,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[TrendController] getArchive error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch archive',
      timestamp: new Date().toISOString(),
    });
  }
}


async function pickUpTrend(req, res) {
  const { trendId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await supabase
    .from('trends')
    .update({
      picked_up: true,
      picked_by: userId,
      picked_at: new Date().toISOString()
    })
    .eq('id', trendId)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ success: true, trend: data[0] });
}

module.exports = { getTrends, getTrendById, getArchive, pickUpTrend };

// GET trends grouped by cluster
exports.getTrendsByClusters = async (req, res) => {
  try {
    const { data: trends, error } = await supabase
      .from('trends')
      .select('*')
      .is('archived_at', null)
      .order('cluster, velocity_score', { ascending: [true, false] });

    if (error) throw error;

    // Group by cluster
    const grouped = {};
    trends.forEach(trend => {
      const cluster = trend.cluster || 'Uncategorized';
      if (!grouped[cluster]) {
        grouped[cluster] = [];
      }
      grouped[cluster].push(trend);
    });

    // Convert to array
    const clustered = Object.entries(grouped).map(([name, trends]) => ({
      name,
      count: trends.length,
      totalSpectrum: trends.reduce((sum, t) => 
        sum + (t.velocity_score || 0) + (t.platform_score || 0) + 
        (t.novelty_score || 0) + (t.community_score || 0) + 
        (t.adoption_score || 0) + (t.category_score || 0), 0
      ),
      trends
    }));

    res.json({ success: true, data: clustered });
  } catch (err) {
    console.error('Error fetching clustered trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET trends grouped by cluster
exports.getTrendsByClusters = async (req, res) => {
  try {
    const { data: trends, error } = await supabase
      .from('trends')
      .select('*')
      .is('archived_at', null)
      .order('cluster, velocity_score', { ascending: [true, false] });

    if (error) throw error;

    // Group by cluster
    const grouped = {};
    trends.forEach(trend => {
      const cluster = trend.cluster || 'Uncategorized';
      if (!grouped[cluster]) {
        grouped[cluster] = [];
      }
      grouped[cluster].push(trend);
    });

    // Convert to array
    const clustered = Object.entries(grouped).map(([name, trends]) => ({
      name,
      count: trends.length,
      totalSpectrum: trends.reduce((sum, t) => 
        sum + (t.velocity_score || 0) + (t.platform_score || 0) + 
        (t.novelty_score || 0) + (t.community_score || 0) + 
        (t.adoption_score || 0) + (t.category_score || 0), 0
      ),
      trends
    }));

    res.json({ success: true, data: clustered });
  } catch (err) {
    console.error('Error fetching clustered trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


