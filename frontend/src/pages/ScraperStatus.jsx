import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { Progress } from '../components/Progress';
import { getScraperStatus, triggerScraper } from '../api';

// Format timestamp to IST with 12-hour AM/PM format
const formatIST = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

export const ScraperStatus = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [scraperRunning, setScraperRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [triggerTime, setTriggerTime] = useState(null);
  const [runIdTracking, setRunIdTracking] = useState(null);

  const loadStatus = async () => {
    try {
      const data = await getScraperStatus();
      const newRuns = (data.lastRuns || []).sort((a, b) => 
        new Date(b.startedAt) - new Date(a.startedAt)
      );
      setRuns(newRuns);
      setLastRefresh(new Date());

      // Detect if the run we triggered has completed
      if (scraperRunning && runIdTracking && newRuns.length > 0) {
        const trackedRun = newRuns.find(run => run.runId === runIdTracking);
        
        if (trackedRun && trackedRun.status === 'completed') {
          // Run is done, clear the progress bar
          setScraperRunning(false);
          setElapsedSeconds(0);
          setTriggerTime(null);
          setRunIdTracking(null);
          localStorage.removeItem('scraperTriggerTime');
          localStorage.removeItem('scraperRunId');
          Toast.success(`Scraper completed: ${trackedRun.trendsCreated} created, ${trackedRun.trendsSkipped} skipped`);
        }
      }
    } catch (error) {
      console.error('Failed to load scraper status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedTriggerTime = localStorage.getItem('scraperTriggerTime');
    const savedRunId = localStorage.getItem('scraperRunId');
    
    if (savedTriggerTime && savedRunId) {
      const triggerTimeObj = new Date(savedTriggerTime);
      const now = new Date();
      const secondsElapsed = Math.floor((now - triggerTimeObj) / 1000);
      
      // Only restore if triggered within last 10 minutes
      if (secondsElapsed < 600) {
        setTriggerTime(triggerTimeObj);
        setRunIdTracking(savedRunId);
        setScraperRunning(true);
        setElapsedSeconds(secondsElapsed);
      } else {
        localStorage.removeItem('scraperTriggerTime');
        localStorage.removeItem('scraperRunId');
      }
    }

    loadStatus();
  }, []);

  // Poll status — faster when running, slower when idle
  useEffect(() => {
    const pollInterval = scraperRunning ? 3000 : 10000; // 3s when running, 10s when idle
    const interval = setInterval(loadStatus, pollInterval);
    return () => clearInterval(interval);
  }, [scraperRunning, runIdTracking]);

  // Track elapsed time while scraper is running
  useEffect(() => {
    if (!scraperRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const newSeconds = prev + 1;
        
        // Timeout after 5 minutes (300 seconds) — clear if no response
        if (newSeconds > 300) {
          console.warn('Scraper run timeout — clearing progress bar');
          setScraperRunning(false);
          setTriggerTime(null);
          setRunIdTracking(null);
          localStorage.removeItem('scraperTriggerTime');
          localStorage.removeItem('scraperRunId');
          Toast.warning('Scraper timeout — please refresh to check status');
          return 0;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scraperRunning]);

  const handleTrigger = async () => {
    try {
      setTriggering(true);
      const now = new Date();
      
      // Trigger scraper and get the actual run ID from the backend
      const response = await triggerScraper();
      const actualRunId = response?.runId || response?.data?.runId;
      
      if (!actualRunId) {
        throw new Error('Backend did not return run ID');
      }

      setTriggerTime(now);
      setRunIdTracking(actualRunId);
      setScraperRunning(true);
      setElapsedSeconds(0);
      
      // Save to localStorage
      localStorage.setItem('scraperTriggerTime', now.toISOString());
      localStorage.setItem('scraperRunId', actualRunId);
      
      Toast.success('Scraper job triggered');
      
      // Refresh immediately
      setTimeout(loadStatus, 500);
    } catch (error) {
      console.error('Failed to trigger scraper:', error);
      Toast.error('Failed to trigger scraper');
      setScraperRunning(false);
      setTriggerTime(null);
      setRunIdTracking(null);
      localStorage.removeItem('scraperTriggerTime');
      localStorage.removeItem('scraperRunId');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <Progress isVisible={scraperRunning} elapsedSeconds={elapsedSeconds} />

      <div className="px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-28 font-bold text-gray-900">Scraper Status</h1>
              <p className="text-14 text-gray-600 mt-2">Monitor scraper runs and trigger manual jobs</p>
            </div>
            <Button 
              onClick={handleTrigger} 
              variant="primary" 
              disabled={triggering || scraperRunning}
              className="whitespace-nowrap"
            >
              {triggering ? 'Starting...' : scraperRunning ? 'Running...' : 'Run Scraper Now'}
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-14 font-semibold text-gray-900 mb-2">Next Scheduled Run</h3>
              <p className="text-18 font-bold text-gray-900">8:00 AM IST</p>
              <p className="text-13 text-gray-600 mt-1">Daily at 8:00 AM India Standard Time</p>
              <p className="text-12 text-gray-500 mt-2">Cron: 30 2 * * * UTC</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-14 font-semibold text-gray-900 mb-2">Current Status</h3>
              <p className={`text-18 font-bold ${scraperRunning ? 'text-blue-600' : 'text-green-600'}`}>
                {scraperRunning ? 'Running' : 'Active'}
              </p>
              <p className="text-13 text-gray-600 mt-1">Scraper is operational</p>
              <p className="text-12 text-gray-500 mt-2">Last refresh: {formatIST(lastRefresh.toISOString())}</p>
            </div>
          </div>

          {/* Run History Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-16 font-bold text-gray-900">Run History</h3>
              <p className="text-13 text-gray-600 mt-1">Latest runs first (all times in IST)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-12 font-semibold text-gray-700 uppercase tracking-wide">Run ID</th>
                    <th className="px-6 py-4 text-left text-12 font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left text-12 font-semibold text-gray-700 uppercase tracking-wide">Started (IST)</th>
                    <th className="px-6 py-4 text-left text-12 font-semibold text-gray-700 uppercase tracking-wide">Duration</th>
                    <th className="px-6 py-4 text-right text-12 font-semibold text-gray-700 uppercase tracking-wide">Fetched</th>
                    <th className="px-6 py-4 text-right text-12 font-semibold text-gray-700 uppercase tracking-wide">Created</th>
                    <th className="px-6 py-4 text-right text-12 font-semibold text-gray-700 uppercase tracking-wide">Skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {runs && runs.length > 0 ? (
                    runs.map((run, idx) => (
                      <tr key={idx} className={`${idx === 0 ? 'bg-blue-50' : ''} hover:bg-gray-50 transition`}>
                        <td className="px-6 py-4 text-13 font-mono text-gray-900">{run.runId.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-13">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-12 font-semibold ${
                              run.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {run.status === 'completed' ? '✓' : '✗'} {run.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-13 text-gray-700 font-mono">{formatIST(run.startedAt)}</td>
                        <td className="px-6 py-4 text-13 text-gray-600">
                          {run.durationSeconds < 60
                            ? `${run.durationSeconds}s`
                            : `${Math.floor(run.durationSeconds / 60)}m ${run.durationSeconds % 60}s`}
                        </td>
                        <td className="px-6 py-4 text-13 text-gray-700 text-right font-semibold">{run.itemsFetched}</td>
                        <td className="px-6 py-4 text-13 text-green-600 text-right font-semibold">{run.trendsCreated}</td>
                        <td className="px-6 py-4 text-13 text-orange-600 text-right font-semibold">{run.trendsSkipped}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No scraper runs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {runs && runs.length > 0 && runs[0].errorMessage && (
              <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
                <p className="text-12 text-yellow-800">
                  <span className="font-semibold">Latest note:</span> {runs[0].errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
