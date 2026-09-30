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

  const getRelevanceColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
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

  const relevanceScore = trend.broadway_relevance_score || trend.score || 50;

  return (
    <>
      <Nav />
      <div className="trend-detail-container">
        <button className="back-btn" onClick={() => navigate('/trends')}>
          ← Back to Trends
        </button>

        <div className="detail-content">
          {/* Header */}
          <div className="detail-header">
            <h1>{trend.title || trend.post_title}</h1>
            <div className="detail-meta">
              <span className="source-tag">{trend.source || 'Editorial'}</span>
              <span className="date-tag">
                {new Date(trend.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="detail-grid">
            {/* Left Column - Overview & Description */}
            <div className="detail-column-left">
              <section className="detail-section">
                <h2>📋 Overview</h2>
                <p className="overview-text">
                  {trend.description || trend.catalyst_summary}
                </p>
              </section>

              {/* Sentiment & Engagement */}
              <section className="detail-section">
                <h2>📊 Community Engagement</h2>
                <div className="engagement-grid">
                  <div className="engagement-item">
                    <span className="engagement-icon">👍</span>
                    <div>
                      <div className="engagement-value">{trend.upvotes || 0}</div>
                      <div className="engagement-label">Upvotes</div>
                    </div>
                  </div>
                  <div className="engagement-item">
                    <span className="engagement-icon">💬</span>
                    <div>
                      <div className="engagement-value">{trend.comments_count || 0}</div>
                      <div className="engagement-label">Comments</div>
                    </div>
                  </div>
                  {trend.sentiment && (
                    <div className="engagement-item">
                      <span className="engagement-icon">
                        {trend.sentiment === 'positive' && '😊'}
                        {trend.sentiment === 'negative' && '😞'}
                        {trend.sentiment === 'neutral' && '😐'}
                        {trend.sentiment === 'mixed' && '🤔'}
                      </span>
                      <div>
                        <div className="engagement-value" style={{ textTransform: 'capitalize' }}>
                          {trend.sentiment}
                        </div>
                        <div className="engagement-label">Sentiment</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Categories */}
              {(trend.relevant_broadway_categories || trend.category) && (
                <section className="detail-section">
                  <h2>🏷️ Categories</h2>
                  <div className="categories">
                    {(trend.relevant_broadway_categories || [trend.category]).filter(Boolean).map(cat => (
                      <span key={cat} className="category-badge">{cat}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Analysis & Metrics */}
            <div className="detail-column-right">
              {/* Broadway Relevance Card */}
              <div className="analysis-card relevance-card" style={{ borderColor: getRelevanceColor(relevanceScore) }}>
                <div className="card-label">Broadway Relevance</div>
                <div className="relevance-large" style={{ color: getRelevanceColor(relevanceScore) }}>
                  {relevanceScore}%
                </div>
                <p className="card-description">
                  {trend.broadway_relevance_reason || 'Community trend with engagement potential'}
                </p>
              </div>

              {/* Analysis Confidence */}
              <div className="analysis-card confidence-card">
                <div className="card-label">Analysis Confidence</div>
                <div className="confidence-large">{trend.analysis_confidence || 75}%</div>
                <p className="card-description">
                  {trend.analysis_confidence >= 80 ? 'High confidence assessment' : 'Moderate confidence assessment'}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="analysis-card stats-card">
                <div className="card-label">Quick Stats</div>
                <div className="stats-list">
                  <div className="stat-row">
                    <span>Created</span>
                    <strong>{new Date(trend.created_at).toLocaleDateString()}</strong>
                  </div>
                  {trend.updated_at && (
                    <div className="stat-row">
                      <span>Updated</span>
                      <strong>{new Date(trend.updated_at).toLocaleDateString()}</strong>
                    </div>
                  )}
                  <div className="stat-row">
                    <span>Source</span>
                    <strong>{trend.source || 'Editorial'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="detail-actions">
            {trend.post_url && (
              <a 
                href={trend.post_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                View Original Source →
              </a>
            )}
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/trends')}
            >
              View All Trends
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendDetail;
