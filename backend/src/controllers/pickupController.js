const { supabase } = require('../config/supabase');

async function markPickedUp(req, res) {
  try {
    const { trendId } = req.params;
    const { authorName } = req.body;

    if (!authorName) {
      return res.status(400).json({ success: false, error: 'authorName required' });
    }

    const { data, error } = await supabase
      .from('trends')
      .update({
        picked_up: true,
        picked_up_by: authorName,
        picked_up_at: new Date().toISOString()
      })
      .eq('id', trendId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Trend not found' });
    }

    res.json({ success: true, trend: data[0] });
  } catch (err) {
    console.error(`[Pickup] Mark failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getPickupStatus(req, res) {
  try {
    const { trendId } = req.params;

    const { data, error } = await supabase
      .from('trends')
      .select('picked_up, picked_up_by, picked_up_at')
      .eq('id', trendId)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Trend not found' });
    }

    res.json({ success: true, status: data });
  } catch (err) {
    console.error(`[Pickup] Get status failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  markPickedUp,
  getPickupStatus,
};
