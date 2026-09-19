const db = require('../db/trends');

async function getTrends(req, res, next) {
  try {
    const { status = 'active', category, source, sort = 'latest', limit = 10, offset = 0, search } = req.query;

    let queryText = 'SELECT * FROM trends WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (status === 'active') {
      queryText += ' AND archived_at IS NULL';
    } else if (status === 'archived') {
      queryText += ' AND archived_at IS NOT NULL';
    }

    if (category) {
      const categories = category.split(',');
      queryText += ` AND category = ANY($${paramCount}::varchar[])`;
      params.push(categories);
      paramCount++;
    }

    if (source) {
      const sources = source.split(',');
      queryText += ` AND source = ANY($${paramCount}::varchar[])`;
      params.push(sources);
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

    const result = await db.query(queryText, params);
    const trends = result.rows;

    const countResult = await db.query('SELECT COUNT(*) FROM trends WHERE archived_at IS NULL');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      status: 'success',
      data: {
        trends,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_next: offset + parseInt(limit) < total,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function getTrendById(req, res, next) {
  try {
    const { id } = req.params;

    const trendResult = await db.query('SELECT * FROM trends WHERE id = $1', [id]);
    if (trendResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 'TREND_NOT_FOUND',
        message: `Trend with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const trend = trendResult.rows[0];

    const actionsResult = await db.query(
      'SELECT id, user_id, action_type, content, created_at FROM team_actions WHERE trend_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        ...trend,
        team_actions: actionsResult.rows,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function getArchive(req, res, next) {
  try {
    const { category, source, search, limit = 10, offset = 0 } = req.query;

    let queryText = 'SELECT id, title, source, category, created_at, archived_at, picked_up, picked_up_at FROM trends WHERE archived_at IS NOT NULL';
    let params = [];
    let paramCount = 1;

    if (category) {
      const categories = category.split(',');
      queryText += ` AND category = ANY($${paramCount}::varchar[])`;
      params.push(categories);
      paramCount++;
    }

    if (source) {
      const sources = source.split(',');
      queryText += ` AND source = ANY($${paramCount}::varchar[])`;
      params.push(sources);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ' ORDER BY archived_at DESC';
    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(queryText, params);
    const trends = result.rows;

    const countResult = await db.query('SELECT COUNT(*) FROM trends WHERE archived_at IS NOT NULL');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      status: 'success',
      data: {
        trends,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_next: offset + parseInt(limit) < total,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getTrends, getTrendById, getArchive };
