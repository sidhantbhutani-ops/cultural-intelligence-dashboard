import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Nav = ({ user }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-20 font-bold text-gray-900">Broadway Trends</h1>
          <div className="flex gap-6">
            <button onClick={() => navigate('/trends')} className="text-14 text-gray-700 hover:text-gray-900">Active Trends</button>
            <button onClick={() => navigate('/archive')} className="text-14 text-gray-700 hover:text-gray-900">Archive</button>
            <button onClick={() => navigate('/scraper-status')} className="text-14 text-gray-700 hover:text-gray-900">Scraper Status</button>
            <button onClick={() => navigate('/sources')} className="text-14 text-gray-700 hover:text-gray-900">Sources</button>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-14 text-gray-700 hover:text-gray-900">
            {user || 'User'} ▼
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md">
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-14 text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
