import React from 'react';
import './UnifiedTrendCard.css';

const UnifiedTrendCard = ({ trend, onPickUp, isEditorial = false }) => {
  // Handle both editorial and micro-trends data structures
  const title = trend.post_title || trend.title;
  const description = trend.catalyst_summary || trend.description;
  const upvotes = trend.upvotes;
  const comments = trend.comments_count || 0;
  const relevanceScore = trend.broadway_relevance_score || trend.score || 50;
  const relevanceReason = trend.broadway_relevance_reason || `Score: ${relevanceScore}`;
  const categories = trend.relevant_broadway_categories || [trend.category] || ['general'];
  const sentiment = trend.sentiment || 'neutral';
  const confidence = trend.analysis_confidence || 75;
  const source = trend.subreddit || trend.source || 'Editorial';
  const url = trend.post_url || (isEditorial ? `/trends/${trend.id}` : '#');

  const getRelevanceColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getSentimentIcon = (sent) => {
    const icons = { positive: '😊', neutral: '😐', mixed: '🤔', negative: '😞' };
    return icons[sent] || '😐';
  };

  return (
    <div className="unified-trend-card">
      <div className="card-header">
        <div className="source-tag">{source}</div>
        <div className="sentiment-badge">
          {getSentimentIcon(sentiment)} {sentiment}
        </div>
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>

      <div className="card-metrics">
        <div className="metric">
          <span className="metric-label">Engagement</span>
          <span className="metric-value">👍 {upvotes} • 💬 {comments}</span>
        </div>
      </div>

      <div className="relevance-section">
        <div className="relevance-score" style={{ borderColor: getRelevanceColor(relevanceScore) }}>
          <div className="score-value" style={{ color: getRelevanceColor(relevanceScore) }}>
            {relevanceScore}%
          </div>
          <div className="score-label">Relevance</div>
        </div>
        <p className="relevance-reason">{relevanceReason}</p>
      </div>

      {categories && categories.length > 0 && (
        <div className="categories">
          {categories.map((cat) => (
            <span key={cat} className="category-tag">{cat}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <a href={url} target={isEditorial ? '_self' : '_blank'} rel="noopener noreferrer" className="view-link">
          {isEditorial ? 'View Details' : 'View on Reddit'} →
        </a>
        <div className="confidence">
          {confidence}% confidence
        </div>
      </div>

      {isEditorial && onPickUp && (
        <button 
          onClick={() => onPickUp(trend.id)}
          className="pick-up-btn"
        >
          Pick Up
        </button>
      )}
    </div>
  );
};

export default UnifiedTrendCard;
