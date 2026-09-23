import { useState, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { Spinner } from '../components/Spinner';

export const Team = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
    setError('Team management not available');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-32 font-bold text-gray-900 mb-4">Team</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};
