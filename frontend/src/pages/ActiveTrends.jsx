import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FilterBar } from '../components/FilterBar';
import { TrendCard } from '../components/TrendCard';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { getTrends, triggerScraper } from '../api';
import { TrendDetail } from '../components/TrendDetail';

export const ActiveTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [scraperLoading, setScraperLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', velocity: '', status: '' });

  useEffect(() => {
    loadTrends();
  }, [filters, search]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: filters.category,
        velocity: filters.velocity,
      };
      const data = await getTrends(params);
      setTrends(data.trends || []);
    } catch (error) {
      Toast.error('Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async () => {
    setScraperLoading(true);
    try {
      await triggerScraper();
      Toast.success('Scraper triggered. Refreshing in 10s...');
      setTimeout(() => loadTrends(), 10000);
    } catch (error) {
      Toast.error('Failed to trigger scraper');
    } finally {
      setScraperLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTrendSelect = (trend) => {
    setSelectedTrend(trend);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-32 font-bold text-gray-900">Active Trends</h1>
        <Button 
          onClick={handleRunScraper} 
          variant="primary" 
          loading={scraperLoading}
        >
          Run Scraper Now
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
        <Input 
          type="search"
          placeholder="Search trends by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-700">No trends found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {trends.map(trend => (
            <TrendCard 
              key={trend.id} 
              trend={trend} 
              onClick={() => handleTrendSelect(trend)}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        title={selectedTrend?.title}
      >
        {selectedTrend && (
          <TrendDetail 
            trend={selectedTrend} 
            onUpdate={() => loadTrends()}
          />
        )}
      </Modal>
    </div>
  );
};
