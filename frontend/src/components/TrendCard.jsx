import { Badge } from './Badge';
import { SpectrumViz } from './SpectrumViz';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
};

export const TrendCard = ({ trend, onClick, onPickUp }) => {
  const coverageSources = typeof trend.coverage_sources === 'string' 
    ? JSON.parse(trend.coverage_sources) 
    : (trend.coverage_sources || []);
  const sourceCount = coverageSources.length;
  const timeAgo = formatTimeAgo(trend.picked_at);

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-4 gap-6">
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
            {sourceCount > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 font-medium">
                  Covered by {sourceCount} source{sourceCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          <Badge variant="primary" size="sm" className="mb-3">{trend.category}</Badge>
        </div>
        
        <div className="w-64 flex-shrink-0">
          <SpectrumViz trend={trend} />
        </div>
      </div>

      <p className="text-14 text-gray-700 mb-4 leading-relaxed line-clamp-2">{trend.description}</p>

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
              ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {trend.picked_up ? `✓ Picked ${timeAgo ? `(${timeAgo})` : ''}` : 'Pick Up'}
        </button>
      </div>

      <div className="flex items-center gap-2 text-10 text-gray-500 mt-3">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        Live
      </div>
    </div>
  );
};
