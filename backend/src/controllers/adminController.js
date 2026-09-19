const db = require('../config/database');

async function getSources(req, res, next) {
  try {
    const { status = 'active', type } = req.query;

    let queryText = 'SELECT * FROM scraper_sources WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (status === 'active') {
      queryText += ' AND is_active = true';
    } else if (status === 'inactive') {
      queryText += ' AND is_active = false';
    }

    if (type) {
      const types = type.split(',');
      queryText += ` AND source_type = ANY($${paramCount}::varchar[])`;
      params.push(types);
      paramCount++;
    }

    queryText += ' ORDER BY priority ASC, created_at DESC';

    const result = await db.query(queryText, params);

    const activeCount = (await db.query('SELECT COUNT(*) FROM scraper_sources WHERE is_active = true')).rows[0].count;
    const inactiveCount = (await db.query('SELECT COUNT(*) FROM scraper_sources WHERE is_active = false')).rows[0].count;

    res.json({
      status: 'success',
      data: {
        sources: result.rows,
        total: result.rows.length,
        active_count: activeCount,
        inactive_count: inactiveCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function createSource(req, res, next) {
  try {
    const { name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, concurrent_requests, priority, description } = req.body;
    const userId = req.user.email;

    // Validation
    if (!name || name.length < 10 || name.length > 100) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'name must be between 10 and 100 characters',
        timestamp: new Date().toISOString(),
      });
    }

    const validTypes = ['instagram', 'twitter', 'reddit', 'tiktok', 'news', 'rss'];
    if (!validTypes.includes(source_type)) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: `source_type must be one of: ${validTypes.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await db.query(
      `INSERT INTO scraper_sources (name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, concurrent_requests, priority, description, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, source_type, base_url, scrape_strategy, engagement_metric, rate_limit_per_hour, concurrent_requests, priority, description, userId]
    );

    res.status(201).json({
      status: 'success',
      code: 'SOURCE_CREATED',
      data: { id: result.rows[0].id, name: result.rows[0].name, created_at: result.rows[0].created_at },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function getSourceById(req, res, next) {
  try {
    const { id } = req.params;

    const sourceResult = await db.query('SELECT * FROM scraper_sources WHERE id = $1', [id]);
    if (sourceResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 'SOURCE_NOT_FOUND',
        message: `Source with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const healthResult = await db.query(
      'SELECT * FROM source_health_logs WHERE source_id = $1 ORDER BY attempted_at DESC LIMIT 10',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        source: sourceResult.rows[0],
        recent_health: healthResult.rows,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function updateSource(req, res, next) {
  try {
    const { id } = req.params;
    const { name, is_active, priority, rate_limit_per_hour, description } = req.body;
    const userId = req.user.email;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
      paramCount++;
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }
    if (rate_limit_per_hour !== undefined) {
      updates.push(`rate_limit_per_hour = $${paramCount}`);
      params.push(rate_limit_per_hour);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramCount}`);
    params.push(userId);
    paramCount++;

    params.push(id);

    const result = await db.query(
      `UPDATE scraper_sources SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 'SOURCE_NOT_FOUND',
        message: `Source with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: 'success',
      code: 'SOURCE_UPDATED',
      data: { id: result.rows[0].id, name: result.rows[0].name, updated_at: result.rows[0].updated_at },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteSource(req, res, next) {
  try {
    const { id } = req.params;

    // Check if it's the last active source
    const activeCount = (await db.query('SELECT COUNT(*) FROM scraper_sources WHERE is_active = true')).rows[0].count;
    if (activeCount === 1) {
      const source = (await db.query('SELECT is_active FROM scraper_sources WHERE id = $1', [id])).rows[0];
      if (source.is_active) {
        return res.status(400).json({
          status: 'error',
          code: 'CANNOT_DELETE_LAST_SOURCE',
          message: 'Cannot delete the last active source. Deactivate instead.',
          timestamp: new Date().toISOString(),
        });
      }
    }

    const result = await db.query('DELETE FROM scraper_sources WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 'SOURCE_NOT_FOUND',
        message: `Source with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: 'success',
      code: 'SOURCE_DELETED',
      data: { id: result.rows[0].id, name: result.rows[0].name, deleted_at: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSources, createSource, getSourceById, updateSource, deleteSource };
