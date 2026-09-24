const API_BASE = import.meta.env.VITE_API_URL || 'https://cultural-intelligence-dashboard.onrender.com/api';

// Auth
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
}

export function getAuthToken() {
  return localStorage.getItem('token');
}

// Trends
export async function getTrends() {
  const response = await fetch(`${API_BASE}/trends`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch trends');
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function getTrendDetail(id) {
  const response = await fetch(`${API_BASE}/trends/${id}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch trend');
  return response.json();
}

export async function pickupTrend(id) {
  const response = await fetch(`${API_BASE}/trends/${id}/pick`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to pickup trend');
  return response.json();
}

// Archive
export async function getArchive() {
  const response = await fetch(`${API_BASE}/trends/archive`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch archive');
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function archiveTrend(id) {
  const response = await fetch(`${API_BASE}/trends/${id}/archive`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to archive trend');
  return response.json();
}

// Scraper
export async function getScraperStatus() {
  const response = await fetch(`${API_BASE}/scraper/status`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch scraper status');
  return response.json();
}

export async function triggerScraper() {
  const response = await fetch(`${API_BASE}/scraper/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to trigger scraper');
  return response.json();
}

export async function cancelScraper() {
  const response = await fetch(`${API_BASE}/scraper/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to cancel scraper');
  return response.json();
}

// Team members
export async function getTeamMembers() {
  const response = await fetch(`${API_BASE}/team/members`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch team members');
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}
