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

  const getScoreColor = (score) => {
    if (score >= 15) return '#4CAF50';
    if (score >= 10) return '#FF9800';
    return '#F44336';
  };

  const renderSpectrum = () => {
    const scores = [
      { label: 'Rarity', value: trend.rare_score || 0 },
      { label: 'Authenticity', value: trend.auth_score || 0 },
      { label: 'Distinctiveness', value: trend.dis_score || 0 },
      { label: 'Social', value: trend.social_score || 0 },
      { label: 'Velocity', value: trend.velocity_score || 0 },
      { label: 'Platform', value: trend.platform_score || 0 },
      { label: 'Novelty', value: trend.novelty_score || 0 },
      { label: 'Community', value: trend.community_score || 0 },
    ];

    return (
      <div className="spectrum-grid">
        {scores.map((score) => (
          <div key={score.label} className="spectrum-item">
            <div className="spectrum-bar">
              <div 
                className="spectrum-fill" 
                style={{
                  width: `${(score.value / 20) * 100}%`,
                  backgroundColor: getScoreColor(score.value)
                }}
              />
            </div>
            <div className="spectrum-label">{score.label}</div>
            <div className="spectrum-value">{score.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderBrandActivations = () => {
    if (!trend.brand_activations) return null;
    
    const activations = Array.isArray(trend.brand_activations) 
      ? trend.brand_activations 
      : typeof trend.brand_activations === 'string'
      ? JSON.parse(trend.brand_activations)
      : [];

    return (
      <div className="activations-list">
        {activations.map((activation, idx) => (
          <div key={idx} className="activation-card">
            <div className="activation-name">🎯 {activation.name}</div>
            <div className="activation-reason">{activation.reason}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderActionMapping = () => {
    if (!trend.action_mapping) return null;

    const mapping = typeof trend.action_mapping === 'string'
      ? JSON.parse(trend.action_mapping)
      : trend.action_mapping;

    return (
      <div className="action-mapping-grid">
        <div className="action-item">
          <div className="action-icon">📱</div>
          <div className="action-title">Content Idea</div>
          <div className="action-text">{mapping.content_idea}</div>
        </div>
        <div className="action-item">
          <div className="action-icon">🚀</div>
          <div className="action-title">Product Launch</div>
          <div className="action-text">{mapping.product_launch}</div>
        </div>
        <div className="action-item">
          <div className="action-icon">🏪</div>
          <div className="action-title">In-Store Activation</div>
          <div className="action-text">{mapping.in_store_activation}</div>
        </div>
      </div>
    );
  };

  const renderConsumptionTriggers = () => {
    if (!trend.consumption_triggers) return null;

    const triggers = typeof trend.consumption_triggers === 'string'
      ? JSON.parse(trend.consumption_triggers)
      : trend.consumption_triggers;

    return (
      <div className="triggers-grid">
        <div className="trigger-section">
          <div className="trigger-title">How They Engage</div>
          <p>{triggers.how}</p>
        </div>
        <div className="trigger-section">
          <div className="trigger-title">When They Engage</div>
          <p>{triggers.when}</p>
        </div>
        <div className="trigger-section">
          <div className="trigger-title">Where They Engage</div>
          <p>{triggers.where}</p>
        </div>
      </div>
    );
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
          {/* Header */}
          <div className="detail-header">
            <h1>{trend.title}</h1>
            <div className="detail-meta">
              <span className="source-tag">{trend.source}</span>
              <span className="date-tag">
                {new Date(trend.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Overview */}
          <section className="detail-section">
            <h2>📋 Overview</h2>
            <p className="overview-text">{trend.description}</p>
          </section>

          {/* Layer 1: SPECTRUM BREAKDOWN */}
          <section className="detail-section">
            <h2>📊 Spectrum Breakdown</h2>
            <p className="section-desc">8-dimensional cultural impact analysis</p>
            {renderSpectrum()}
          </section>

          {/* Layer 2: CLAUDE INSIGHT */}
          {trend.spectrum_insight && (
            <section className="detail-section insight-section">
              <h2>🧠 Cultural Intelligence</h2>
              <div className="insight-box">
                <p>{trend.spectrum_insight}</p>
              </div>
            </section>
          )}

          {/* Layer 3: BRAND ACTIVATIONS */}
          {trend.brand_activations && (
            <section className="detail-section">
              <h2>🎯 Brand Activations</h2>
              <p className="section-desc">Which Broadway brands should move on this</p>
              {renderBrandActivations()}
            </section>
          )}

          {/* Layer 4: ACTION MAPPING */}
          {trend.action_mapping && (
            <section className="detail-section">
              <h2>🎬 Executable Ideas</h2>
              <p className="section-desc">Content, Product, and In-Store Activation</p>
              {renderActionMapping()}
            </section>
          )}

          {/* Layer 5: CONSUMPTION TRIGGERS */}
          {trend.consumption_triggers && (
            <section className="detail-section">
              <h2>🎯 Consumption Triggers</h2>
              <p className="section-desc">How, when, and where Gen-Z engages with this</p>
              {renderConsumptionTriggers()}
            </section>
          )}

          {/* Categories & Engagement */}
          <section className="detail-section bottom-section">
            <div className="bottom-grid">
              {trend.category && (
                <div className="bottom-item">
                  <h3>Category</h3>
                  <span className="category-badge">{trend.category}</span>
                </div>
              )}
              <div className="bottom-item">
                <h3>Engagement</h3>
                <div className="engagement-quick">
                  <span>👍 {trend.engagement_metric || 0}</span>
                  <span>📱 {trend.source}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="detail-actions">
            {trend.source_url && (
              <a 
                href={trend.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                View Source →
              </a>
            )}
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/trends')}
            >
              Back to All Trends
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendDetail;
