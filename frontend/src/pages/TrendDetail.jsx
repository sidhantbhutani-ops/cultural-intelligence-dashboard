import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Nav';
import './TrendDetail.css';

const TrendDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendDetail();
  }, [id]);

  const fetchTrendDetail = async () => {
    try {
      const res = await fetch(
        `https://cultural-intelligence-dashboard.onrender.com/api/trends`
      );
      if (res.ok) {
        const data = await res.json();
        const found = data.find(t => t.id === id);
        if (found) {
          setTrend(found);
        } else {
          setError('Trend not found');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="trend-detail-container loading">Loading...</div>
      </>
    );
  }

  if (error || !trend) {
    return (
      <>
        <Nav />
        <div className="trend-detail-container error">
          <p>{error || 'Trend not found'}</p>
          <button onClick={() => navigate('/trends')}>← Back to Trends</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="trend-detail-container">
        <button className="back-btn" onClick={() => navigate('/trends')}>
          ← Back to Trends
        </button>

        <div className="detail-content">
          <div className="detail-header">
            <h1>{trend.title || trend.post_title}</h1>
            <div className="detail-meta">
              <span className="source-tag">{trend.source || 'Editorial'}</span>
              <span className="date-tag">
                {new Date(trend.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="detail-body">
            <div className="description-section">
              <h2>Overview</h2>
              <p>{trend.description || trend.catalyst_summary}</p>
            </div>

            <div className="metrics-section">
              <div className="metric-card">
                <div className="metric-title">Broadway Relevance</div>
                <div className="metric-large">
                  {trend.broadway_relevance_score || trend.score || 50}%
                </div>
                <p>{trend.broadway_relevance_reason || 'Community engagement'}</p>
              </div>

              <div className="metric-card">
                <div className="metric-title">Engagement</div>
                <div className="engagement-stats">
                  <div>👍 {trend.upvotes || 0} Upvotes</div>
                  <div>💬 {trend.comments_count || 0} Comments</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-title">Analysis Confidence</div>
                <div className="metric-large">
                  {trend.analysis_confidence || 75}%
                </div>
              </div>
            </div>

            {trend.relevant_broadway_categories && (
              <div className="categories-section">
                <h2>Categories</h2>
                <div className="categories">
                  {trend.relevant_broadway_categories.map(cat => (
                    <span key={cat} className="category-badge">{cat}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="action-section">
              {trend.post_url && (
                <a 
                  href={trend.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-link"
                >
                  View Original →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendDetail;
