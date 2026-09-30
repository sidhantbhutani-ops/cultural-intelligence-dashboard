import React, { useState, useEffect } from 'react';
import './MicroTrendsTab.css';

const MicroTrendsTab = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const categories = ['all', 'beauty', 'fashion', 'wellness', 'lifestyle', 'streetwear', 'footwear', 'general'];

  useEffect(() => {
    fetchTrends();
  }, [selectedCategory, sortBy]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === 'all' ? '' : `&category=${selectedCategory}`;
      const url = `https://cultural-intelligence-dashboard.onrender.com/api/micro-trends?sortBy=${sortBy}${categoryParam}&limit=20`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Handle the correct API response structure
      const microTrends = data.data?.microTrends || data.data || [];
      setTrends(Array.isArray(microTrends) ? microTrends : []);
    } catch (error) {
      console.error('Failed to fetch micro-trends:', error);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      positive: '😊',
      neutral: '😐',
      mixed: '🤔',
      negative: '😞'
    };
    return icons[sentiment] || '😐';
  };

  return (
    <div className="micro-trends-tab">
      <div className="micro-trends-header">
        <h2>Reddit Micro-Trends</h2>
        <p className="subtitle">Trending topics from 9 Indian subreddits, analyzed with Claude AI</p>
      </div>

      <div className="micro-trends-controls">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="relevance">Relevance (High to Low)</option>
            <option value="engagement">Engagement (Most Active)</option>
            <option value="fresh">Fresh (Newest First)</option>
          </select>
        </div>

        <button onClick={fetchTrends} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading micro-trends...</div>
      ) : trends.length === 0 ? (
        <div className="empty-state">No trends found for this category</div>
      ) : (
        <div className="trends-grid">
          {trends.map((trend) => (
            <div key={trend.id} className="trend-card">
              <div className="trend-header">
                <div className="subreddit-tag">{trend.subreddit}</div>
                <div className="sentiment-badge">
                  {getSentimentIcon(trend.sentiment)} {trend.sentiment}
                </div>
              </div>

              <h3 className="trend-title">{trend.post_title}</h3>

              <p className="trend-catalyst">{trend.catalyst_summary}</p>

              <div className="trend-metrics">
                <div className="metric">
                  <span className="metric-label">Upvotes</span>
                  <span className="metric-value">👍 {trend.upvotes}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Comments</span>
                  <span className="metric-value">💬 {trend.comments_count}</span>
                </div>
              </div>

              <div className="relevance-section">
                <div className="relevance-score" style={{ borderColor: getRelevanceColor(trend.broadway_relevance_score || 50) }}>
                  <div className="score-value" style={{ color: getRelevanceColor(trend.broadway_relevance_score || 50) }}>
                    {trend.broadway_relevance_score || '—'}%
                  </div>
                  <div className="score-label">Broadway Relevance</div>
                </div>
                <p className="relevance-reason">{trend.broadway_relevance_reason || 'Analysis pending'}</p>
              </div>

              {trend.relevant_broadway_categories && Array.isArray(trend.relevant_broadway_categories) && trend.relevant_broadway_categories.length > 0 && (
                <div className="categories">
                  {trend.relevant_broadway_categories.map((cat) => (
                    <span key={cat} className="category-tag">{cat}</span>
                  ))}
                </div>
              )}

              <div className="trend-footer">
                <a href={trend.post_url} target="_blank" rel="noopener noreferrer" className="view-post-btn">
                  View on Reddit →
                </a>
                <div className="confidence">
                  {trend.analysis_confidence ? `Confidence: ${trend.analysis_confidence}%` : 'Analyzing...'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MicroTrendsTab;
