const { supabase } = require('../config/supabase');

const getTeamMembers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      status: 'success',
      data: {
        team_members: data || [],
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ status: 'error', message: 'Name and email are required' });
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([{ name, email, avatar, is_active: true }])
      .select();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      data: { team_member: data[0] },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, is_active } = req.body;

    const { data, error } = await supabase
      .from('team_members')
      .update({ name, email, avatar, is_active, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Team member not found' });
    }

    res.json({
      status: 'success',
      data: { team_member: data[0] },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const assignTrend = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const { data, error } = await supabase
      .from('trends')
      .update({ assigned_to, picked_up: true, picked_up_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Trend not found' });
    }

    res.json({
      status: 'success',
      data: { trend: data[0] },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const unassignTrend = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('trends')
      .update({ assigned_to: null, picked_up: false })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      status: 'success',
      data: { trend: data[0] },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  assignTrend,
  unassignTrend,
};
