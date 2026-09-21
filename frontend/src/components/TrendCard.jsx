import { Badge } from './Badge';

export const TrendCard = ({ trend, onClick }) => {
  const velocityColors = {
    'Emerging': 'info',
    'Peaking': 'warning',
    'Declining': 'danger',
  };

  const totalRAD = (trend.rare_score || 0) + (trend.auth_score || 0) + (trend.dis_score || 0) + (trend.social_score || 0);
  const radPercentage = (totalRAD / 100) * 100;

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-md p-6 hover:shadow-md transition-all cursor-pointer"
    >
      {/* RAD Score Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-18 font-semibold text-gray-900 mb-1">{trend.title}</h3>
          <div className="flex gap-2 mb-2 text-12 text-gray-700">
            <span>{trend.source}</span>
            <span>•</span>
            <Badge variant="primary" size="sm">{trend.category}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-24 font-bold text-blue-600">{totalRAD}</div>
          <div className="text-10 text-gray-500">RAD Score</div>
        </div>
      </div>

      {/* RAD Bars */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div>
          <div className="flex items-end justify-between mb-1">
            <span className="text-10 font-medium text-gray-600">Rare</span>
            <span className="text-10 font-bold text-gray-700">{trend.rare_score || 0}</span>
          </div>
          <div className="w-full h-8 bg-gray-100 rounded overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${((trend.rare_score || 0) / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-1">
            <span className="text-10 font-medium text-gray-600">Auth</span>
            <span className="text-10 font-bold text-gray-700">{trend.auth_score || 0}</span>
          </div>
          <div className="w-full h-8 bg-gray-100 rounded overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${((trend.auth_score || 0) / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-1">
            <span className="text-10 font-medium text-gray-600">Dis</span>
            <span className="text-10 font-bold text-gray-700">{trend.dis_score || 0}</span>
          </div>
          <div className="w-full h-8 bg-gray-100 rounded overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${((trend.dis_score || 0) / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-1">
            <span className="text-10 font-medium text-gray-600">Social</span>
            <span className="text-10 font-bold text-gray-700">{trend.social_score || 0}</span>
          </div>
          <div className="w-full h-8 bg-gray-100 rounded overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all"
              style={{ width: `${((trend.social_score || 0) / 25) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Velocity & Engagement */}
      <div className="flex gap-2 mb-3">
        <Badge variant={velocityColors[trend.velocity]} size="sm">
          {trend.velocity}
        </Badge>
        <span className="text-12 text-gray-700">Engagement: {trend.engagement_metric}</span>
      </div>

      {/* Editorial Insight */}
      {trend.editorial_insight && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
          <p className="text-12 text-blue-900 font-medium">{trend.editorial_insight}</p>
        </div>
      )}

      {/* Description */}
      <p className="text-14 text-gray-700 mb-4 line-clamp-2">{trend.description}</p>

      {/* Angles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {trend.angles && trend.angles.slice(0, 2).map((angle, i) => (
          <Badge key={i} size="sm">{angle}</Badge>
        ))}
      </div>

      <div className="flex justify-between items-center text-12 text-gray-700">
        <div className="flex gap-4">
          <span>Sources: {trend.source_count || 1}</span>
        </div>
        <span className="text-blue-500 hover:text-blue-600">View Detail →</span>
      </div>
    </div>
  );
};
