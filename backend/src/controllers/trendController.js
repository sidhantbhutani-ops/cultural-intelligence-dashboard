const { query } = require('../config/supabase.js');

async function getTrends(req, res, next) {
  try {
    const { category, source, sort = 'latest', limit = 10, offset = 0, search } = req.query;

    let queryText = 'SELECT * FROM trends WHERE archived_at IS NULL';
    let params = [];

    if (category) {
      queryText += ` AND category = '${category}'`;
    }

    if (source) {
      queryText += ` AND source = '${source}'`;
    }

    if (search) {
      queryText += ` AND (title ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
    }

    if (sort === 'latest') {
      queryText += ' ORDER BY created_at DESC';
    } else if (sort === 'trending') {
      queryText += ' ORDER BY engagement_metric DESC';
    } else if (sort === 'oldest') {
      queryText += ' ORDER BY created_at ASC';
    }

    queryText += ` LIMIT ${limit} OFFSET ${offset}`;

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

    if (search) {
      queryText += ` AND (title ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
    }

    if (category) {
      queryText += ` AND category = '${category}'`;
    }

    queryText += ' ORDER BY archived_at DESC LIMIT ' + limit + ' OFFSET ' + offset;

    const result = await query(queryText, []);
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

module.exports = { getTrends, getTrendById, getArchive };
