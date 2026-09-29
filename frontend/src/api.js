const API_BASE = 'https://cultural-intelligence-dashboard.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function getScraperStatus() {
  const response = await fetch(`${API_BASE}/scraper/status`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch scraper status');
  const json = await response.json();
  return json.data;  // ← UNWRAP: return just the data object
}

export async function triggerScraper() {
  const response = await fetch(`${API_BASE}/scraper/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to trigger scraper');
  return response.json();
}

export async function cancelScraper(runId) {
  const response = await fetch(`${API_BASE}/scraper/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify({ runId }),
  });
  if (!response.ok) throw new Error('Failed to cancel scraper');
  return response.json();
}

// Add the rest of your API functions here...
