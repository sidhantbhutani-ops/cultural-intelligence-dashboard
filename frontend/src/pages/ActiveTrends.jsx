import { useState, useEffect } from 'react';
import { TrendCard } from '../components/TrendCard';
import { TrendDetail } from '../components/TrendDetail';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { getTrends, getTeamMembers } from '../api';

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
      const response = await getTrends();
      const trendsData = response.data || [];
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
        <div className="grid gap-6">
          {filteredTrends.map(trend => (
            <div
              key={trend.id}
              onClick={() => handleTrendClick(trend)}
              className="cursor-pointer bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-16 font-bold text-gray-900">{trend.title}</h3>
                  <p className="text-13 text-gray-600 mt-1">{trend.source}</p>
                </div>
                {trend.assigned_to && (
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-12 font-semibold text-blue-700">{teamMembers[trend.assigned_to] || 'Assigned'}</span>
                  </div>
                )}
              </div>
              <p className="text-14 text-gray-700 line-clamp-2">{trend.description}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 bg-gray-100 text-12 font-semibold text-gray-700 rounded">{trend.category}</span>
                <span className="px-2 py-1 bg-gray-100 text-12 font-semibold text-gray-700 rounded">{trend.velocity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDetailModal} onClose={handleCloseModal} title="Trend Details" large>
        {selectedTrend && <TrendDetail trend={selectedTrend} onUpdate={handleUpdate} />}
      </Modal>
    </div>
  );
};
