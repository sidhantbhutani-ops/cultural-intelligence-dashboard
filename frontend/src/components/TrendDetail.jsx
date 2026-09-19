import { useState } from 'react';
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
      onUpdate();
    } catch (error) {
      Toast.error('Failed to mark picked up');
    }
  };

  const velocityColors = {
    'Emerging': 'info',
    'Peaking': 'warning',
    'Declining': 'danger',
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2 text-12 text-gray-700">
            <a href={trend.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
              {trend.source}
            </a>
            <span>•</span>
            <Badge variant="primary" size="sm">{trend.category}</Badge>
            <Badge variant={velocityColors[trend.velocity]} size="sm">{trend.velocity}</Badge>
          </div>
          <p className="text-12 text-gray-700">
            Engagement: {trend.engagement_metric} | Posted: {new Date(trend.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-16 font-semibold text-gray-900">Description</h3>
          <p className="text-14 text-gray-700 leading-relaxed">{trend.description}</p>
        </div>

        {trend.angles && trend.angles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-16 font-semibold text-gray-900">Content Angles</h3>
            <ul className="list-disc list-inside space-y-1">
              {trend.angles.map((angle, i) => (
                <li key={i} className="text-14 text-gray-700">{angle}</li>
              ))}
            </ul>
          </div>
        )}

        <CommentSection trendId={trend.id} />
      </div>

      <div className="space-y-6">
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-3 mb-4">
            <div className="text-12 text-gray-700">
              <p className="font-semibold mb-1">Pickup Status</p>
              {markedUp ? (
                <p className="text-green-600">✓ Picked up by {trend.picked_up_by}</p>
              ) : (
                <p className="text-gray-500">Not picked up</p>
              )}
            </div>
          </div>
          {!markedUp && (
            <Button 
              onClick={handleMarkPickedUp} 
              variant="primary" 
              size="md"
              className="w-full"
            >
              Mark Picked Up
            </Button>
          )}
        </div>

        <TagsSection trendId={trend.id} />
      </div>
    </div>
  );
};
