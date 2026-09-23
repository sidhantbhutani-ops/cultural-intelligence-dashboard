const express = require('express');
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all trends
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle pick up
router.post('/:id/pick', authMiddleware, async (req, res) => {
  try {
    const { data: trend } = await supabase
      .from('trends')
      .select('picked_up')
      .eq('id', req.params.id)
      .single();

    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const newPickedState = !trend.picked_up;
    const { error } = await supabase
      .from('trends')
      .update({
        picked_up: newPickedState,
        picked_at: newPickedState ? new Date().toISOString() : null
      })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, picked_up: newPickedState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
