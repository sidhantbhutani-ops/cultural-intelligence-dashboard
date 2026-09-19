export const FilterBar = ({ filters, onFilterChange }) => {
  const categories = ['All', 'Fashion', 'Beauty', 'Sports', 'Pop-Culture', 'Music', 'Collectibles', 'Wellness', 'Lifestyle'];
  const velocities = ['All', 'Emerging', 'Peaking', 'Declining'];
  const statuses = ['All', 'Not Picked Up', 'Picked Up', 'Archived'];

  return (
    <div className="flex gap-4 flex-wrap">
      <select 
        value={filters.category} 
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="border border-gray-200 rounded-md px-3 py-2 text-14"
      >
        {categories.map(cat => <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>)}
      </select>
      
      <select 
        value={filters.velocity} 
        onChange={(e) => onFilterChange('velocity', e.target.value)}
        className="border border-gray-200 rounded-md px-3 py-2 text-14"
      >
        {velocities.map(vel => <option key={vel} value={vel === 'All' ? '' : vel}>{vel}</option>)}
      </select>
      
      <select 
        value={filters.status} 
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="border border-gray-200 rounded-md px-3 py-2 text-14"
      >
        {statuses.map(st => <option key={st} value={st === 'All' ? '' : st}>{st}</option>)}
      </select>
    </div>
  );
};
