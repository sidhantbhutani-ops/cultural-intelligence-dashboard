import { useState } from 'react';
import { Badge } from './Badge';

export const TrendModal = ({ trend, onClose }) => {
  const totalSpectrum = (trend.velocity_score || 0) + (trend.platform_score || 0) + 
                        (trend.novelty_score || 0) + (trend.community_score || 0) + 
                        (trend.adoption_score || 0) + (trend.category_score || 0);

  const spectrumDimensions = [
    { key: 'velocity_score', label: 'Velocity', max: 25, color: '#ef4444' },
    { key: 'platform_score', label: 'Platform Spread', max: 20, color: '#f97316' },
    { key: 'novelty_score', label: 'Novelty', max: 20, color: '#eab308' },
    { key: 'community_score', label: 'Community', max: 15, color: '#22c55e' },
    { key: 'adoption_score', label: 'Adoption', max: 10, color: '#3b82f6' },
    { key: 'category_score', label: 'Category', max: 10, color: '#a855f7' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-24 font-bold text-gray-900 mb-2">{trend.title}</h2>
            <div className="flex gap-2 items-center text-13">
              <span className="text-gray-600">{trend.source}</span>
              <span className="text-gray-400">•</span>
              <a 
                href={trend.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Read Article →
              </a>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-2xl font-bold text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded">
              <p className="text-11 text-gray-500 font-medium">SPECTRUM Score</p>
              <p className="text-28 font-bold text-indigo-600">{totalSpectrum}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <Badge variant="primary" size="sm">{trend.category}</Badge>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-11 text-gray-500 font-medium">Status</p>
              <p className="text-14 font-semibold text-green-600">Live</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-14 text-gray-700 leading-relaxed">{trend.description}</p>
          </div>

          {/* Why It Matters */}
          {trend.cultural_significance && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-12 text-amber-900">
                <span className="font-semibold">Why it matters:</span> {trend.cultural_significance}
              </p>
            </div>
          )}

          {/* SPECTRUM Insight */}
          {trend.spectrum_insight && (
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
              <p className="text-12 text-indigo-900">{trend.spectrum_insight}</p>
            </div>
          )}

          {/* SPECTRUM Bars */}
          <div>
            <p className="text-13 font-bold text-gray-900 mb-3">SPECTRUM Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              {spectrumDimensions.map((dim) => (
                <div key={dim.key}>
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-11 font-medium text-gray-600">{dim.label}</span>
                    <span className="text-11 font-bold">{trend[dim.key] || 0}/{dim.max}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-sm">
                    <div 
                      style={{ 
                        width: \`\${((trend[dim.key] || 0) / dim.max) * 100}%\`,
                        backgroundColor: dim.color,
                        transition: 'width 0.3s ease-in-out',
                        borderRadius: '9999px',
                        opacity: 0.9
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {trend.action_mapping && (
            <div>
              <p className="text-13 font-bold text-gray-900 mb-3">How to Activate</p>
              <div className="grid grid-cols-1 gap-3">
                {trend.action_mapping.content_idea && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-11 font-semibold text-blue-900 mb-1">💬 Content Idea</p>
                    <p className="text-12 text-blue-800">{trend.action_mapping.content_idea}</p>
                  </div>
                )}
                {trend.action_mapping.in_store_activation && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                    <p className="text-11 font-semibold text-purple-900 mb-1">🏪 In-Store Activation</p>
                    <p className="text-12 text-purple-800">{trend.action_mapping.in_store_activation}</p>
                  </div>
                )}
                {trend.action_mapping.product_launch && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                    <p className="text-11 font-semibold text-orange-900 mb-1">🚀 Product Launch</p>
                    <p className="text-12 text-orange-800">{trend.action_mapping.product_launch}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consumption Triggers */}
          {trend.consumption_triggers && (
            <div>
              <p className="text-13 font-bold text-gray-900 mb-3">Gen-Z Consumption Patterns</p>
              <div className="grid grid-cols-1 gap-3">
                {trend.consumption_triggers.when && (
                  <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded">
                    <p className="text-11 font-semibold text-rose-900 mb-1">⏰ When</p>
                    <p className="text-12 text-rose-800">{trend.consumption_triggers.when}</p>
                  </div>
                )}
                {trend.consumption_triggers.where && (
                  <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded">
                    <p className="text-11 font-semibold text-cyan-900 mb-1">📱 Where</p>
                    <p className="text-12 text-cyan-800">{trend.consumption_triggers.where}</p>
                  </div>
                )}
                {trend.consumption_triggers.how && (
                  <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded">
                    <p className="text-11 font-semibold text-teal-900 mb-1">💭 How</p>
                    <p className="text-12 text-teal-800">{trend.consumption_triggers.how}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Broadway Brands */}
          {trend.brand_activations && trend.brand_activations.length > 0 && (
            <div>
              <p className="text-13 font-bold text-gray-900 mb-3">Broadway Brands to Activate</p>
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded space-y-2">
                {trend.brand_activations.map((brand, idx) => (
                  <div key={idx}>
                    <p className="text-12 font-semibold text-emerald-900">{brand.name}</p>
                    <p className="text-11 text-emerald-800">{brand.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Angles */}
          {trend.angles && trend.angles.length > 0 && (
            <div>
              <p className="text-13 font-bold text-gray-900 mb-3">Editorial Angles</p>
              <ul className="text-12 text-gray-700 space-y-2">
                {trend.angles.map((angle, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
