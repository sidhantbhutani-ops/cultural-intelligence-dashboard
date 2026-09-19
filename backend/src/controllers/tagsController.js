const { supabase } = require('../config/supabase');

async function addTag(req, res) {
  try {
    const { trendId } = req.params;
    const { tag } = req.body;

    const validTags = ['content-idea', 'event-potential', 'brand-collab', 'social-angle'];
    if (!validTags.includes(tag)) {
      return res.status(400).json({ success: false, error: `Invalid tag. Must be one of: ${validTags.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('team_actions')
      .insert([{
        trend_id: trendId,
        action_type: 'tag',
        tag_name: tag,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.json({ success: true, tag: data[0] });
  } catch (err) {
    console.error(`[Tags] Add failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getTags(req, res) {
  try {
    const { trendId } = req.params;

    const { data, error } = await supabase
      .from('team_actions')
      .select('tag_name')
      .eq('trend_id', trendId)
      .eq('action_type', 'tag');

    if (error) throw error;

    const tags = (data || []).map(t => t.tag_name);
    res.json({ success: true, tags });
  } catch (err) {
    console.error(`[Tags] Get failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function removeTag(req, res) {
  try {
    const { trendId, tag } = req.params;

    const { error } = await supabase
      .from('team_actions')
      .delete()
      .eq('trend_id', trendId)
      .eq('action_type', 'tag')
      .eq('tag_name', tag);

    if (error) throw error;

    res.json({ success: true, message: 'Tag removed' });
  } catch (err) {
    console.error(`[Tags] Remove failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  addTag,
  getTags,
  removeTag,
};
