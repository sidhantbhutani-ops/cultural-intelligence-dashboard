import { Badge } from './Badge';

export const TrendCard = ({ trend, onClick }) => {
  const velocityColors = {
    'emerging': 'info',
    'peaking': 'warning',
    'declining': 'danger',
    'established': 'success',
  };

  const totalRAD = (trend.rare_score || 0) + (trend.auth_score || 0) + (trend.dis_score || 0) + (trend.social_score || 0);

  // Mock Broadway category mapping (will be replaced with real mapping)
  const broadwayBrands = {
    'fashion': ['Lovebirds', 'Rahul Mishra', 'Karva Cinna', 'Psych', 'Nykaa Fashion'],
    'beauty': ['Nykaa', 'Purplle', 'Mama Earth', 'The Derma Co'],
    'lifestyle': ['Urban Ladder', 'Craftroots', 'Wunderlust'],
    'wellness': ['Curefoods', 'Neuherbs', 'Wellnesscare'],
  };

  const relevantBrands = broadwayBrands[trend.category] || [];

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
    >
      {/* Header with RAD Score */}
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
        
        {/* RAD Score */}
        <div className="text-right">
          <div className="text-32 font-bold text-blue-600">{totalRAD}</div>
          <div className="text-11 text-gray-500 font-medium">RAD Score</div>
          {totalRAD === 0 && <div className="text-10 text-gray-400">(Pending)</div>}
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

      {/* RAD Score Bars (only show if scores exist) */}
      {totalRAD > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-10 font-medium text-gray-600">Rare</span>
              <span className="text-10 font-bold">{trend.rare_score || 0}</span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${((trend.rare_score || 0) / 25) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-10 font-medium text-gray-600">Auth</span>
              <span className="text-10 font-bold">{trend.auth_score || 0}</span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${((trend.auth_score || 0) / 25) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-10 font-medium text-gray-600">Dis</span>
              <span className="text-10 font-bold">{trend.dis_score || 0}</span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-full bg-orange-500"
                style={{ width: `${((trend.dis_score || 0) / 25) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-10 font-medium text-gray-600">Social</span>
              <span className="text-10 font-bold">{trend.social_score || 0}</span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: `${((trend.social_score || 0) / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Velocity Badge */}
      <div className="mb-4">
        <Badge variant={velocityColors[trend.velocity] || 'primary'} size="sm">
          {trend.velocity?.charAt(0).toUpperCase() + trend.velocity?.slice(1)}
        </Badge>
      </div>

      {/* Editorial Angles */}
      <div className="mb-4">
        <p className="text-12 font-semibold text-gray-700 mb-2">Editorial Angles:</p>
        <div className="space-y-2">
          {trend.angles && trend.angles.map((angle, i) => (
            <div key={i} className="flex gap-2 text-13 text-gray-700">
              <span className="text-blue-500 font-bold">•</span>
              <span>{angle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Broadway Brands */}
      {relevantBrands.length > 0 && (
        <div className="mb-4">
          <p className="text-12 font-semibold text-gray-700 mb-2">Relevant Broadway Brands:</p>
          <div className="flex gap-2 flex-wrap">
            {relevantBrands.slice(0, 4).map((brand, i) => (
              <Badge key={i} variant="secondary" size="sm">{brand}</Badge>
            ))}
            {relevantBrands.length > 4 && (
              <Badge variant="secondary" size="sm">+{relevantBrands.length - 4} more</Badge>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-12 text-gray-500 pt-4 border-t border-gray-100">
        <span>{trend.happening === 'active' ? '🔴 Live' : '⚪ Archive'}</span>
        <span className="text-blue-500 font-medium">Click to view details →</span>
      </div>
    </div>
  );
};
