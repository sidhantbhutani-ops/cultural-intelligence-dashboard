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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const trendsData = await getTrends();
      setTrends(trendsData || []);
      setFilteredTrends(trendsData || []);
    } catch (error) {
      Toast.error('Failed to load trends');
      console.error('Load trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = trends;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Sort by SPECTRUM score
    filtered.sort((a, b) => {
      const aScore = (a.velocity_score || 0) + (a.platform_score || 0) + (a.novelty_score || 0) + 
                     (a.community_score || 0) + (a.adoption_score || 0) + (a.category_score || 0);
      const bScore = (b.velocity_score || 0) + (b.platform_score || 0) + (b.novelty_score || 0) + 
                     (b.community_score || 0) + (b.adoption_score || 0) + (b.category_score || 0);
      return sortDirection === 'desc' ? bScore - aScore : aScore - bScore;
    });

    setFilteredTrends(filtered);
  }, [searchTerm, categoryFilter, sortDirection, trends]);

  const handleTrendClick = (trend) => {
    setSelectedTrend(trend);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTrend(null);
  };

  const handlePickUp = async (trendId) => {
    try {
      await api.post(`/trends/${trendId}/pick`);
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
        
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            <option value="pop-culture">Pop Culture</option>
            <option value="fashion">Fashion</option>
            <option value="wellness">Wellness</option>
            <option value="technology">Technology</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
          
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="desc">SPECTRUM Score: High to Low</option>
            <option value="asc">SPECTRUM Score: Low to High</option>
          </select>
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
