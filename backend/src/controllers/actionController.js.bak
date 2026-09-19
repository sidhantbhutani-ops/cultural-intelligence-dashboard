const db = require('../config/database');

async function createAction(req, res, next) {
  try {
    const { id: trendId } = req.params;
    const { action_type, content } = req.body;
    const userId = req.user.email;

    // Validate action type
    const validActions = ['comment', 'tag', 'mark_picked_up'];
    if (!validActions.includes(action_type)) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid action_type',
        details: { field: 'action_type', error: `Must be one of: ${validActions.join(', ')}` },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate content
    if (action_type !== 'mark_picked_up' && !content) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'content is required for comment and tag actions',
        details: { field: 'content', error: 'Must be between 2 and 500 characters' },
        timestamp: new Date().toISOString(),
      });
    }

    // Check trend exists
    const trendResult = await db.query('SELECT id, picked_up FROM trends WHERE id = $1', [trendId]);
    if (trendResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 'TREND_NOT_FOUND',
        message: `Trend with ID '${trendId}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle mark_picked_up
    if (action_type === 'mark_picked_up') {
      if (trendResult.rows[0].picked_up) {
        return res.status(409).json({
          status: 'error',
          code: 'ALREADY_PICKED_UP',
          message: 'This trend was already picked up',
          timestamp: new Date().toISOString(),
        });
      }

      await db.query(
        'UPDATE trends SET picked_up = true, picked_up_by = $1, picked_up_at = CURRENT_TIMESTAMP WHERE id = $2',
        [userId, trendId]
      );
    }

    // Create action record
    const result = await db.query(
      `INSERT INTO team_actions (trend_id, user_id, action_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [trendId, userId, action_type, content || null]
    );

    res.status(201).json({
      status: 'success',
      code: 'ACTION_CREATED',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createAction };
