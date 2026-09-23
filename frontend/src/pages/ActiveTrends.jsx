import { useState, useEffect } from 'react';
import { TrendCard } from '../components/TrendCard';
import { TrendModal } from '../components/TrendModal';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { getTrends, api } from '../api';

export const ActiveTrends = () => {
  const [trends, setTrends] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

    // Sort by SPECTRUM score descending
    filtered.sort((a, b) => {
      const aScore = (a.velocity_score || 0) + (a.platform_score || 0) + (a.novelty_score || 0) + 
                     (a.community_score || 0) + (a.adoption_score || 0) + (a.category_score || 0);
      const bScore = (b.velocity_score || 0) + (b.platform_score || 0) + (b.novelty_score || 0) + 
                     (b.community_score || 0) + (b.adoption_score || 0) + (b.category_score || 0);
      return bScore - aScore;
    });

    setFilteredTrends(filtered);
  }, [searchTerm, trends]);

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
      await api(`/trends/${trendId}/pick`, { method: 'POST' });
      loadTrends();
    } catch (error) {
      Toast.error('Failed to update trend');
      console.error('Error picking up trend:', error);
    }
  };

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
