const express = require('express');
const { supabase } = require('../config/supabase');
const { scoreTrend } = require('../services/radScorer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/score-trend', authMiddleware, async (req, res) => {
  try {
    const { trend_id } = req.body;

    if (!trend_id) {
      return res.status(400).json({ error: 'trend_id required' });
    }

    const { data: trend, error: fetchError } = await supabase
      .from('trends')
      .select('*')
      .eq('id', trend_id)
      .single();

    if (fetchError || !trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    console.log('[Scoring Route] Fetched trend:', trend.id, trend.title);

    const scores = await scoreTrend(trend);
    
    console.log('[Scoring Route] Scores returned:', scores);

    if (scores.error) {
      console.error('[Scoring Route] Scoring had error:', scores.error);
    }

    const { error: updateError } = await supabase
      .from('trends')
      .update({
        rare_score: scores.rare_score,
        auth_score: scores.auth_score,
        dis_score: scores.dis_score,
        social_score: scores.social_score,
        editorial_insight: scores.editorial_insight
      })
      .eq('id', trend_id);

    if (updateError) {
      console.error('[Scoring Route] Update error:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    console.log('[Scoring Route] ✅ Trend updated');

    res.json({
      status: 'success',
      trend_id,
      scores: {
        rare: scores.rare_score,
        auth: scores.auth_score,
        dis: scores.dis_score,
        social: scores.social_score,
        total: scores.total_score,
        insight: scores.editorial_insight
      }
    });
  } catch (error) {
    console.error('[Scoring Route] Unhandled error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/score-batch', authMiddleware, async (req, res) => {
  try {
    const { trend_ids } = req.body;

    if (!Array.isArray(trend_ids) || trend_ids.length === 0) {
      return res.status(400).json({ error: 'trend_ids array required' });
    }

    const results = [];

    for (const id of trend_ids) {
      const { data: trend } = await supabase
        .from('trends')
        .select('*')
        .eq('id', id)
        .single();

      if (trend) {
        const scores = await scoreTrend(trend);

        await supabase
          .from('trends')
          .update({
            rare_score: scores.rare_score,
            auth_score: scores.auth_score,
            dis_score: scores.dis_score,
            social_score: scores.social_score,
            editorial_insight: scores.editorial_insight
          })
          .eq('id', id);

        results.push({
          id,
          scores: {
            rare: scores.rare_score,
            auth: scores.auth_score,
            dis: scores.dis_score,
            social: scores.social_score,
            total: scores.total_score
          }
        });
      }
    }

    res.json({
      status: 'success',
      scored: results.length,
      results
    });
  } catch (error) {
    console.error('Batch scoring error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
