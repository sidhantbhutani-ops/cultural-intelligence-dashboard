import { useState } from 'react';
import parse from 'html-react-parser';
import { Badge } from './Badge';
import { Button } from './Button';
import { CommentSection } from './CommentSection';
import { TagsSection } from './TagsSection';
import { Toast } from './Toast';
import { markPickedUp } from '../api';

export const TrendDetail = ({ trend, onUpdate }) => {
  const [markedUp, setMarkedUp] = useState(trend.picked_up);

  const handleMarkPickedUp = async () => {
    try {
      await markPickedUp(trend.id);
      setMarkedUp(true);
      Toast.success('Marked picked up');
      if (onUpdate) onUpdate();
    } catch (error) {
      Toast.error('Failed to mark picked up');
    }
  };

  const velocityColors = {
    'emerging': 'info',
    'peaking': 'warning',
    'declining': 'danger',
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-20 font-bold text-gray-900">{trend.title}</h2>
          <div className="flex gap-2 text-12 text-gray-700">
            <a href={trend.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold">
              {trend.source}
            </a>
            <span>•</span>
            <Badge variant="primary" size="sm">{trend.category}</Badge>
            <Badge variant={velocityColors[trend.velocity?.toLowerCase()] || 'default'} size="sm">{trend.velocity}</Badge>
          </div>
          <p className="text-12 text-gray-600">
            Engagement: {trend.engagement_metric} | Posted: {new Date(trend.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-16 font-semibold text-gray-900">Description</h3>
          <div className="text-14 text-gray-700 leading-relaxed">
            {parse(trend.description || '')}
          </div>
        </div>

        {trend.happening && (
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-14 font-semibold text-gray-900">What's Happening</h3>
            <p className="text-13 text-gray-700 leading-relaxed">{trend.happening}</p>
          </div>
        )}

        {trend.cultural_significance && (
          <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
            <h3 className="text-14 font-semibold text-gray-900">Cultural Significance</h3>
            <p className="text-13 text-gray-700 leading-relaxed">{trend.cultural_significance}</p>
          </div>
        )}

        {trend.angles && trend.angles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-16 font-semibold text-gray-900">Content Angles</h3>
            <ul className="list-disc list-inside space-y-2">
              {trend.angles.map((angle, i) => (
                <li key={i} className="text-13 text-gray-700">{angle}</li>
              ))}
            </ul>
          </div>
        )}

        <CommentSection trendId={trend.id} onUpdate={onUpdate} />
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-14 font-semibold text-gray-900 mb-3">Pickup Status</h3>
          {markedUp ? (
            <div className="text-13 text-green-600 font-semibold">✓ Picked up</div>
          ) : (
            <Button onClick={handleMarkPickedUp} variant="primary" fullWidth>
              Mark Picked Up
            </Button>
          )}
        </div>

        <TagsSection trendId={trend.id} onUpdate={onUpdate} />
      </div>
    </div>
  );
};
