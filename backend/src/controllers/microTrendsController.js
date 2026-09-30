const supabase = require('../config/supabase');

async function getMicroTrends(req, res) {
  try {
    const { 
      category, 
      sortBy = 'relevance', 
      limit = 20, 
      offset = 0,
      minRelevance = 0,
      subreddit
    } = req.query;

    let query = `
      SELECT * FROM micro_trends 
      WHERE broadway_relevance_score >= $1
    `;
    let params = [minRelevance];
    let paramCount = 1;

    if (category && category !== 'all') {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (subreddit) {
      paramCount++;
      query += ` AND subreddit = $${paramCount}`;
      params.push(subreddit);
    }

    // Sort options
    if (sortBy === 'relevance') {
      query += ` ORDER BY broadway_relevance_score DESC, posted_at DESC`;
    } else if (sortBy === 'engagement') {
      query += ` ORDER BY (upvotes + (comments_count * 2)) DESC`;
    } else if (sortBy === 'fresh') {
      query += ` ORDER BY posted_at DESC`;
    } else {
      query += ` ORDER BY broadway_relevance_score DESC`;
    }

    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const { rows } = await supabase.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM micro_trends WHERE broadway_relevance_score >= $1`;
    let countParams = [minRelevance];

    if (category && category !== 'all') {
      countQuery += ` AND category = $2`;
      countParams.push(category);
    }

    if (subreddit) {
      countQuery += ` AND subreddit = $${countParams.length + 1}`;
      countParams.push(subreddit);
    }

    const { rows: countResult } = await supabase.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        microTrends: rows || [],
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('[getMicroTrends] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getMicroTrendById(req, res) {
  try {
    const { id } = req.params;

    const { rows } = await supabase.query(
      `SELECT * FROM micro_trends WHERE id = $1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Micro-trend not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('[getMicroTrendById] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getMicroTrendStats(req, res) {
  try {
    const stats = await supabase.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as categories,
        AVG(broadway_relevance_score) as avg_relevance,
        AVG(upvotes + (comments_count * 2)) as avg_engagement,
        COUNT(DISTINCT subreddit) as subreddits_covered
      FROM micro_trends
      WHERE fetched_at > NOW() - INTERVAL '24 hours'
    `);

    res.json({
      success: true,
      data: stats.rows[0] || {}
    });
  } catch (error) {
    console.error('[getMicroTrendStats] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getMicroTrends,
  getMicroTrendById,
  getMicroTrendStats
};
