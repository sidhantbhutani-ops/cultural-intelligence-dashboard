const { supabase } = require('../config/supabase');

async function addComment(req, res) {
  try {
    const { trendId } = req.params;
    const { text, authorName } = req.body;

    if (!text || !authorName) {
      return res.status(400).json({ success: false, error: 'text and authorName required' });
    }

    const { data, error } = await supabase
      .from('team_actions')
      .insert([{
        trend_id: trendId,
        action_type: 'comment',
        comment_text: text,
        author_name: authorName,
        created_at: new Date().toISOString(),
        is_deleted: false
      }])
      .select();

    if (error) throw error;

    res.json({ success: true, comment: data[0] });
  } catch (err) {
    console.error(`[Comments] Add failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getComments(req, res) {
  try {
    const { trendId } = req.params;

    const { data, error } = await supabase
      .from('team_actions')
      .select('*')
      .eq('trend_id', trendId)
      .eq('action_type', 'comment')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, comments: data || [] });
  } catch (err) {
    console.error(`[Comments] Get failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteComment(req, res) {
  try {
    const { trendId, commentId } = req.params;
    const { authorName } = req.body;

    // Verify author owns comment
    const { data: comment, error: fetchErr } = await supabase
      .from('team_actions')
      .select('*')
      .eq('id', commentId)
      .eq('trend_id', trendId)
      .single();

    if (fetchErr || !comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author_name !== authorName) {
      return res.status(403).json({ success: false, error: 'Can only delete own comments' });
    }

    const { error: deleteErr } = await supabase
      .from('team_actions')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (deleteErr) throw deleteErr;

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error(`[Comments] Delete failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
