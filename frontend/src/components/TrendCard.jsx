import { Badge } from './Badge';

export const TrendCard = ({ trend, onClick }) => {
  const velocityColors = {
    'Emerging': 'info',
    'Peaking': 'warning',
    'Declining': 'danger',
  };

  return (
    <div 
      onClick={onClick}
      className="border border-gray-200 rounded-md p-6 hover:shadow-md transition-all cursor-pointer"
    >
      <h3 className="text-18 font-semibold text-gray-900 mb-2">{trend.title}</h3>
      
      <div className="flex gap-2 mb-3 text-12 text-gray-700">
        <span>{trend.source}</span>
        <span>•</span>
        <Badge variant="primary" size="sm">{trend.category}</Badge>
      </div>

      <div className="flex gap-2 mb-3">
        <Badge variant={velocityColors[trend.velocity]} size="sm">
          {trend.velocity}
        </Badge>
        <span className="text-12 text-gray-700">Engagement: {trend.engagement_metric}</span>
      </div>

      <p className="text-14 text-gray-700 mb-4 line-clamp-2">{trend.description}</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {trend.angles && trend.angles.slice(0, 2).map((angle, i) => (
          <Badge key={i} size="sm">{angle}</Badge>
        ))}
      </div>

      <div className="flex justify-between items-center text-12 text-gray-700">
        <div className="flex gap-4">
          <span>Comments: {trend.comments_count || 0}</span>
          <span>Tags: {trend.tags_count || 0}</span>
        </div>
        <span className="text-blue-500 hover:text-blue-600">View Detail →</span>
      </div>
    </div>
  );
};
