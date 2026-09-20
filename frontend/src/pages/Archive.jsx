import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FilterBar } from '../components/FilterBar';
import { TrendCard } from '../components/TrendCard';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { api } from '../api';
import { TrendDetail } from '../components/TrendDetail';

export const Archive = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', source: '' });

  useEffect(() => {
    loadArchive();
  }, [filters, search]);

  const loadArchive = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: filters.category,
        source: filters.source,
      };
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/trends/archive?${queryString}` : '/trends/archive';
      const response = await api(endpoint);
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Failed to load archive:', error);
      Toast.error('Failed to load archived trends');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTrendSelect = (trend) => {
    setSelectedTrend(trend);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setTimeout(() => setSelectedTrend(null), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Archive</h1>
          <p className="text-gray-600 mt-2">Search and filter archived trends</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Input
          placeholder="Search archived trends by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            <option value="sports">Sports</option>
            <option value="pop-culture">Pop Culture</option>
            <option value="movies">Movies</option>
            <option value="music">Music</option>
            <option value="collectibles">Collectibles</option>
            <option value="beauty">Beauty</option>
            <option value="fashion">Fashion</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="wellness">Wellness</option>
          </select>

          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Sources</option>
            <option value="Variety">Variety</option>
            <option value="Rolling Stone">Rolling Stone</option>
            <option value="WIRED">WIRED</option>
            <option value="Design Observer">Design Observer</option>
            <option value="Collab Substack">Collab Substack</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : trends.length > 0 ? (
        <div className="grid gap-4">
          {trends.map(trend => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onClick={() => handleTrendSelect(trend)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No archived trends found. Try adjusting filters.</p>
        </div>
      )}

      {selectedTrend && (
        <Modal isOpen={detailModalOpen} onClose={handleCloseDetail}>
          <TrendDetail trend={selectedTrend} />
        </Modal>
      )}
    </div>
  );
};
