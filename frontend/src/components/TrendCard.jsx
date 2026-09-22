import { Badge } from './Badge';

export const TrendCard = ({ trend, onClick }) => {
  const velocityColors = {
    'emerging': 'info',
    'peaking': 'warning',
    'declining': 'danger',
    'established': 'success',
  };

  // Calculate SPECTRUM total score
  const totalSpectrum = (trend.velocity_score || 0) + (trend.platform_score || 0) + 
                        (trend.novelty_score || 0) + (trend.community_score || 0) + 
                        (trend.adoption_score || 0) + (trend.category_score || 0);

  // Mock Broadway category mapping (will be replaced with real mapping)
  const broadwayBrands = {
    'fashion': ['Lovebirds', 'Rahul Mishra', 'Karva Cinna', 'Psych', 'Nykaa Fashion'],
    'beauty': ['Nykaa', 'Purplle', 'Mama Earth', 'The Derma Co'],
    'lifestyle': ['Urban Ladder', 'Craftroots', 'Wunderlust'],
    'wellness': ['Curefoods', 'Neuherbs', 'Wellnesscare'],
  };

  const relevantBrands = broadwayBrands[trend.category] || [];

  // SPECTRUM dimensions with their max scores
  const spectrumDimensions = [
    { key: 'velocity_score', label: 'Velocity', max: 25, color: '#ef4444' },
    { key: 'platform_score', label: 'Platform Spread', max: 20, color: '#f97316' },
    { key: 'novelty_score', label: 'Novelty', max: 20, color: '#eab308' },
    { key: 'community_score', label: 'Community', max: 15, color: '#22c55e' },
    { key: 'adoption_score', label: 'Adoption', max: 10, color: '#3b82f6' },
    { key: 'category_score', label: 'Category', max: 10, color: '#a855f7' },
  ];

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
    >
      {/* Header with SPECTRUM Score */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-18 font-bold text-gray-900 mb-2">{trend.title}</h3>
          <div className="flex gap-2 items-center mb-2 text-13">
            <span className="text-gray-600">{trend.source}</span>
            <span className="text-gray-400">•</span>
            <a 
              href={trend.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline text-12"
              onClick={(e) => e.stopPropagation()}
            >
              Read Article →
            </a>
          </div>
          <Badge variant="primary" size="sm" className="mb-3">{trend.category}</Badge>
        </div>
        
        {/* SPECTRUM Score */}
        <div className="text-right">
          <div className="text-32 font-bold text-indigo-600">{totalSpectrum}</div>
          <div className="text-11 text-gray-500 font-medium">SPECTRUM Score</div>
          {totalSpectrum === 0 && <div className="text-10 text-gray-400">(Pending)</div>}
        </div>
      </div>

      {/* Description */}
      <p className="text-14 text-gray-700 mb-4 leading-relaxed">{trend.description}</p>

      {/* Cultural Significance */}
      {trend.cultural_significance && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4 rounded">
          <p className="text-12 text-amber-900">
            <span className="font-semibold">Why it matters:</span> {trend.cultural_significance}
          </p>
        </div>
      )}

      {/* SPECTRUM Insight */}
      {trend.spectrum_insight && totalSpectrum > 0 && (
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 mb-4 rounded">
          <p className="text-12 text-indigo-900">{trend.spectrum_insight}</p>
        </div>
      )}

      {/* Action Mapping: Content, In-Store, Product */}
      {trend.action_mapping && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {trend.action_mapping.content_idea && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-10 font-semibold text-blue-900 mb-1">💬 Content Idea</p>
              <p className="text-11 text-blue-800">{trend.action_mapping.content_idea}</p>
            </div>
          )}
          {trend.action_mapping.in_store_activation && (
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded">
              <p className="text-10 font-semibold text-purple-900 mb-1">🏪 In-Store Activation</p>
              <p className="text-11 text-purple-800">{trend.action_mapping.in_store_activation}</p>
            </div>
          )}
          {trend.action_mapping.product_launch && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
              <p className="text-10 font-semibold text-orange-900 mb-1">🚀 Product Launch</p>
              <p className="text-11 text-orange-800">{trend.action_mapping.product_launch}</p>
            </div>
          )}
        </div>
      )}

      {/* SPECTRUM Score Bars (6 dimensions) */}
      {totalSpectrum > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {spectrumDimensions.map((dim) => (
            <div key={dim.key}>
              <div className="flex items-end justify-between mb-1">
                <span className="text-10 font-medium text-gray-600">{dim.label}</span>
                <span className="text-10 font-bold">{trend[dim.key] || 0}/{dim.max}</span>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-sm">
                <div 
                  style={{ 
                    width: `${((trend[dim.key] || 0) / dim.max) * 100}%`,
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
      )}

      {/* Broadway Brand Activations */}
      {trend.brand_activations && trend.brand_activations.length > 0 && (
        <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
          <p className="text-11 font-semibold text-emerald-900 mb-2">Broadway Brands to Activate:</p>
          <div className="space-y-1">
            {trend.brand_activations.map((brand, idx) => (
              <div key={idx} className="text-12 text-emerald-800">
                <span className="font-semibold">{brand.name}</span> — {brand.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Angles */}
      {trend.angles && trend.angles.length > 0 && (
        <div className="mb-4">
          <p className="text-11 font-semibold text-gray-600 mb-2">Editorial Angles:</p>
          <ul className="text-12 text-gray-700 space-y-1">
            {trend.angles.map((angle, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>{angle}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-10 text-gray-500">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        Live
      </div>
    </div>
  );
};
