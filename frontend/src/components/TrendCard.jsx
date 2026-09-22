import { Badge } from './Badge';

export const TrendCard = ({ trend, onClick, onPickUp }) => {
  const totalSpectrum = (trend.velocity_score || 0) + (trend.platform_score || 0) + 
                        (trend.novelty_score || 0) + (trend.community_score || 0) + 
                        (trend.adoption_score || 0) + (trend.category_score || 0);

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
    >
      {/* Header */}
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
        </div>
      </div>

      {/* Description */}
      <p className="text-14 text-gray-700 mb-4 leading-relaxed line-clamp-2">{trend.description}</p>

      {/* View Details + Pick Up Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-13 font-semibold text-indigo-600 hover:text-indigo-700">
          <span>View Details</span>
          <span>→</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPickUp?.(trend.id);
          }}
          className={`px-3 py-1 rounded text-12 font-semibold transition-all ${
            trend.picked_up
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {trend.picked_up ? '✓ Picked' : 'Pick Up'}
        </button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-10 text-gray-500 mt-3">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        Live
      </div>
    </div>
  );
};
