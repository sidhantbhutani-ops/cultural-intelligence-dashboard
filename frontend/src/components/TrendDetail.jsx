import { markPickedUp, assignTrend, unassignTrend } from '../api';
import { Toast } from './Toast';
import { useState } from 'react';

export const TrendDetail = ({ trend, onUpdate }) => {
  const [markedUp, setMarkedUp] = useState(trend.picked_up);

  const handleMarkPickedUp = async () => {
    try {
      await markPickedUp(trend.id);
      setMarkedUp(true);
      Toast.success('Trend marked as picked up');
      onUpdate?.();
    } catch (error) {
      Toast.error('Failed to mark trend');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-20 font-bold text-gray-900 mb-2">{trend.title}</h2>
        <p className="text-14 text-gray-600">{trend.description}</p>
      </div>

      <div>
        <p className="text-12 text-gray-500 mb-2">Source</p>
        <a 
          href={trend.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          {trend.source} →
        </a>
      </div>

      {!markedUp && (
        <button
          onClick={handleMarkPickedUp}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
        >
          Mark as Picked Up
        </button>
      )}

      {markedUp && (
        <div className="px-4 py-2 bg-green-100 text-green-700 rounded font-semibold text-center">
          ✓ Marked as Picked Up
        </div>
      )}
    </div>
  );
};
