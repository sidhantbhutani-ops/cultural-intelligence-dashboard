import React, { useState, useEffect } from 'react';
import UnifiedTrendCard from '../components/UnifiedTrendCard';
import './ActiveTrends.css';

const ActiveTrends = () => {
  const [activeTab, setActiveTab] = useState('editorial');
  const [editorialTrends, setEditorialTrends] = useState([]);
  const [microTrends, setMicroTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      // Fetch editorial trends
      const editorialRes = await fetch(
        'https://cultural-intelligence-dashboard.onrender.com/api/editorial-trends'
      );
      if (editorialRes.ok) {
        const editorialData = await editorialRes.json();
        setEditorialTrends(editorialData.data?.trends || []);
      }

      // Fetch micro trends
      const microRes = await fetch(
        'https://cultural-intelligence-dashboard.onrender.com/api/micro-trends?limit=50'
      );
      if (microRes.ok) {
        const microData = await microRes.json();
        setMicroTrends(microData.data?.microTrends || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickUp = (trendId) => {
    console.log('Picking up trend:', trendId);
    // TODO: Implement pick-up logic
  };

  // Get trends based on active tab
  const trends = activeTab === 'editorial' ? editorialTrends : microTrends;

  // Filter by category
  const filteredTrends = categoryFilter === 'all' 
    ? trends 
    : trends.filter(t => {
        const categories = t.relevant_broadway_categories || [t.category] || [];
        return categories.includes(categoryFilter);
      });

  // Sort trends
  const sortedTrends = [...filteredTrends].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.broadway_relevance_score || b.score || 50) - (a.broadway_relevance_score || a.score || 50);
      case 'engagement':
        return (b.upvotes || 0) - (a.upvotes || 0);
      case 'fresh':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  // Get all categories
  const allCategories = Array.from(
    new Set(
      trends.flatMap(t => t.relevant_broadway_categories || [t.category] || [])
    )
  ).filter(Boolean);

  if (error) {
    return <div className="active-trends-container error">Error: {error}</div>;
  }

  return (
    <div className="active-trends-container">
      <div className="trends-header">
        <h1>🎯 Active Trends</h1>
        <button 
          className="refresh-btn"
          onClick={fetchTrends}
          disabled={loading}
        >
          {loading ? '⟳ Loading...' : '⟳ Refresh'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'editorial' ? 'active' : ''}`}
          onClick={() => setActiveTab('editorial')}
        >
          📰 Editorial Trends {editorialTrends.length > 0 && `(${editorialTrends.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'micro' ? 'active' : ''}`}
          onClick={() => setActiveTab('micro')}
        >
          🔥 Reddit Micro-Trends {microTrends.length > 0 && `(${microTrends.length})`}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="relevance">Broadway Relevance</option>
            <option value="engagement">Engagement</option>
            <option value="fresh">Latest First</option>
          </select>
        </div>
      </div>

      {/* Trends Grid */}
      {loading ? (
        <div className="loading-state">Loading trends...</div>
      ) : sortedTrends.length === 0 ? (
        <div className="empty-state">
          <p>No {activeTab} trends found</p>
        </div>
      ) : (
        <div className="trends-grid">
          {sortedTrends.map((trend) => (
            <UnifiedTrendCard
              key={trend.id || trend.post_id}
              trend={trend}
              isEditorial={activeTab === 'editorial'}
              onPickUp={handlePickUp}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveTrends;
