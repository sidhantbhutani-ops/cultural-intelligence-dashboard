export const SpectrumViz = ({ trend }) => {
  const scores = {
    velocity: trend.velocity_score || 0,
    platform: trend.platform_score || 0,
    novelty: trend.novelty_score || 0,
    community: trend.community_score || 0,
    adoption: trend.adoption_score || 0,
    category: trend.category_score || 0,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossible = 102; // 6 dimensions × ~17 max each
  const percentage = Math.round((total / maxPossible) * 100);

  // Determine status
  let status = 'WATCH';
  let statusColor = 'text-yellow-600 bg-yellow-50';
  if (percentage >= 65) {
    status = 'BLOWING UP';
    statusColor = 'text-red-600 bg-red-50';
  } else if (percentage >= 45) {
    status = 'EMERGING';
    statusColor = 'text-blue-600 bg-blue-50';
  }

  // Dimension colors
  const colors = {
    velocity: 'bg-red-400',
    platform: 'bg-blue-400',
    novelty: 'bg-purple-400',
    community: 'bg-green-400',
    adoption: 'bg-yellow-400',
    category: 'bg-indigo-400',
  };

  const labels = {
    velocity: '🚀 Velocity',
    platform: '📱 Platform',
    novelty: '✨ Novelty',
    community: '💬 Community',
    adoption: '📈 Adoption',
    category: '🎯 Category',
  };

  return (
    <div className="space-y-3">
      {/* Score & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-36 font-bold text-gray-900">{total}</span>
          <span className="text-12 text-gray-500">/ 102</span>
        </div>
        <span className={`px-2 py-1 rounded text-11 font-semibold ${statusColor}`}>
          {status}
        </span>
      </div>

      {/* Dimension breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="text-10 font-medium text-gray-600">{labels[key]}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${colors[key]} transition-all`}
                style={{ width: `${Math.max((value / 17) * 100, 5)}%` }}
              />
            </div>
            <div className="text-9 text-gray-500">{value}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {trend.spectrum_insight && (
        <p className="text-12 text-gray-600 italic border-l-2 border-indigo-300 pl-2">
          "{trend.spectrum_insight}"
        </p>
      )}
    </div>
  );
};
