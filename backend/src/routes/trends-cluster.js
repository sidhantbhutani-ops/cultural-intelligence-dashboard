const express = require('express');
const { query } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/trends/by-cluster - Returns trends grouped by cluster
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: trends, error } = await query(
      `SELECT * FROM trends WHERE archived_at IS NULL ORDER BY cluster, velocity_score DESC`
    );

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

    // Convert to array with cluster name and trends
    const clustered = Object.entries(grouped).map(([name, trends]) => ({
      name,
      count: trends.length,
      totalSpectrum: trends.reduce((sum, t) => sum + (t.velocity_score || 0) + (t.platform_score || 0) + (t.novelty_score || 0) + (t.community_score || 0) + (t.adoption_score || 0) + (t.category_score || 0), 0),
      trends
    }));

    res.json({
      success: true,
      data: clustered,
      totalClusters: clustered.length,
      totalTrends: trends.length
    });
  } catch (err) {
    console.error('Error fetching clustered trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
