import { useState, useEffect } from 'react';
import { TrendCard } from '../components/TrendCard';
import { TrendModal } from '../components/TrendModal';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { getTrends, getTeamMembers, api } from '../api';

export const ActiveTrends = () => {
  const [trends, setTrends] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVelocity, setSelectedVelocity] = useState('all');
  const [teamMembers, setTeamMembers] = useState({});

  useEffect(() => {
    loadTrends();
    loadTeamMembers();
  }, []);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const trendsData = await getTrends();
      setTrends(trendsData);
      setFilteredTrends(trendsData);
    } catch (error) {
      Toast.error('Failed to load trends');
      console.error('Load trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const data = await getTeamMembers();
      const memberMap = {};
      (data.team_members || []).forEach(m => {
        memberMap[m.id] = m.name;
      });
      setTeamMembers(memberMap);
    } catch (error) {
      console.error('Failed to load team members');
    }
  };

  useEffect(() => {
    let filtered = trends;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedVelocity !== 'all') {
      filtered = filtered.filter(t => t.velocity === selectedVelocity);
    }

    // Sort by RAD score descending
    filtered.sort((a, b) => {
      const aRAD = (a.rare_score || 0) + (a.auth_score || 0) + (a.dis_score || 0) + (a.social_score || 0);
      const bRAD = (b.rare_score || 0) + (b.auth_score || 0) + (b.dis_score || 0) + (b.social_score || 0);
      return bRAD - aRAD;
    });

    setFilteredTrends(filtered);
  }, [searchTerm, selectedCategory, selectedVelocity, trends]);

  const handleTrendClick = (trend) => {
    setSelectedTrend(trend);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTrend(null);
  };

  const handleUpdate = () => {
    loadTrends();
  };
  const handlePickUp = async (trendId) => {
    try {
      await api(`/trends/${trendId}/pickup`, { method: 'PATCH' });
      loadTrends();
    } catch (error) {
      Toast.error('Failed to pick up trend');
      console.error('Error picking up trend:', error);
    }
  };

  const categories = [...new Set(trends.map(t => t.category))];
  const velocities = ['emerging', 'peaking', 'declining', 'established'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Search trends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-13 font-semibold text-gray-900 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-13 font-semibold text-gray-900 mb-2">Velocity</label>
            <select
              value={selectedVelocity}
              onChange={(e) => setSelectedVelocity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14"
            >
              <option value="all">All Velocities</option>
              {velocities.map(vel => (
                <option key={vel} value={vel}>{vel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTrends.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-14 text-gray-600">No trends found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTrends.map(trend => (
            <TrendCard 
              key={trend.id}
              trend={trend}
              onClick={() => handleTrendClick(trend)}
              onPickUp={handlePickUp}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showDetailModal} onClose={handleCloseModal} title="Trend Details" large>
        {selectedTrend && <TrendModal trend={selectedTrend} onClose={() => setSelectedTrend(null)} />}
      </Modal>
    </div>
  );
};
