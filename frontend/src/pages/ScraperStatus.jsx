import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { getScraperStatus, triggerScraper } from '../api';

export const ScraperStatus = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching scraper status...');
      const data = await getScraperStatus();
      console.log('Scraper status data:', data);
      setRuns(data.lastRuns || []);
    } catch (error) {
      console.error('Error fetching scraper status:', error);
      setError(error.message || 'Failed to load scraper status');
      Toast.error('Failed to load scraper status');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await triggerScraper();
      Toast.success('Scraper triggered successfully');
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      Toast.error('Failed to trigger scraper');
      console.error(error);
    } finally {
      setTriggering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const getDurationDisplay = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status) => {
    const baseClass = 'px-2 py-1 rounded text-12 font-medium';
    switch (status?.toLowerCase()) {
      case 'success':
        return <span className={`${baseClass} bg-green-100 text-green-700`}>Success</span>;
      case 'failed':
        return <span className={`${baseClass} bg-red-100 text-red-700`}>Failed</span>;
      case 'running':
        return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Running</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h2 className="text-18 font-bold text-red-900 mb-2">Error Loading Scraper Status</h2>
            <p className="text-14 text-red-700 mb-4">{error}</p>
            <Button onClick={fetchStatus} variant="primary" size="md">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-32 font-bold text-gray-900">Scraper Status</h1>
            <p className="text-14 text-gray-600 mt-1">Monitor scraper runs and trigger manual jobs</p>
          </div>
          <Button 
            onClick={handleTrigger} 
            loading={triggering}
            variant="primary"
            size="md"
          >
            Run Scraper Now
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-blue-500">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-14 text-gray-600">Next Scheduled Run</p>
                  <p className="text-16 font-semibold text-gray-900 mt-1">8:00 AM IST (Daily)</p>
                  <p className="text-12 text-gray-500 mt-2">Every day at 8:00 AM India Standard Time</p>
                </div>
                <div>
                  <p className="text-14 text-gray-600">Scraper Status</p>
                  <p className="text-16 font-semibold text-gray-900 mt-1">Active</p>
                  <p className="text-12 text-gray-500 mt-2">Cron job running: 30 2 * * *</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-18 font-bold text-gray-900">Run History</h2>
                <p className="text-14 text-gray-600 mt-1">Last 5 scraper runs</p>
              </div>

              {runs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-14 text-gray-500">No scraper runs recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Run ID</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Started</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Skipped</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-12 font-mono text-gray-900">{run.runId?.substring(0, 8)}...</td>
                          <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                          <td className="px-6 py-4 text-12 text-gray-600">{formatDate(run.startedAt)}</td>
                          <td className="px-6 py-4 text-12 text-gray-600">{getDurationDisplay(run.durationSeconds)}</td>
                          <td className="px-6 py-4 text-12 font-semibold text-gray-900">{run.itemsFetched || 0}</td>
                          <td className="px-6 py-4 text-12 font-semibold text-green-600">{run.trendsCreated || 0}</td>
                          <td className="px-6 py-4 text-12 font-semibold text-orange-600">{run.trendsSkipped || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {runs.some(r => r.errorMessage) && (
              <div className="mt-8 bg-red-50 rounded-lg p-6 border border-red-200">
                <h3 className="text-16 font-bold text-red-900 mb-4">Error Log</h3>
                <div className="space-y-3">
                  {runs
                    .filter(r => r.errorMessage)
                    .map((run, idx) => (
                      <div key={idx} className="text-12 text-red-700">
                        <p className="font-semibold">{formatDate(run.startedAt)}</p>
                        <p>{run.errorMessage}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
