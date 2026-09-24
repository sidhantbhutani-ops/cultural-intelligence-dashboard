const API_BASE = import.meta.env.VITE_API_URL || 'https://cultural-intelligence-dashboard.onrender.com/api';

// ========== Auth & Token ==========
export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  setToken(data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
}

// ========== Axios-like instance (for backwards compatibility) ==========
export const api = {
  get: async (url, config = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Authorization': `Bearer ${getToken()}`, ...config.headers },
    });
    if (!response.ok) throw new Error(`GET ${url} failed`);
    return { data: await response.json() };
  },
  post: async (url, data, config = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...config.headers },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${url} failed`);
    return { data: await response.json() };
  },
  put: async (url, data, config = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...config.headers },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${url} failed`);
    return { data: await response.json() };
  },
  delete: async (url, config = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}`, ...config.headers },
    });
    if (!response.ok) throw new Error(`DELETE ${url} failed`);
    return { data: await response.json() };
  },
};

// ========== Trends ==========
export async function getTrends() {
  const response = await fetch(`${API_BASE}/trends`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch trends');
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function getTrendDetail(id) {
  const response = await fetch(`${API_BASE}/trends/${id}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch trend');
  return response.json();
}

export async function pickupTrend(id) {
  const response = await fetch(`${API_BASE}/trends/${id}/pick`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to pickup trend');
  return response.json();
}

export async function markPickedUp(id) {
  return pickupTrend(id);
}

// ========== Archive ==========
export async function getArchive() {
  const response = await fetch(`${API_BASE}/trends/archive`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch archive');
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function archiveTrend(id) {
  const response = await fetch(`${API_BASE}/trends/${id}/archive`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to archive trend');
  return response.json();
}

// ========== Scraper ==========
export async function getScraperStatus() {
  const response = await fetch(`${API_BASE}/scraper/status`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch scraper status');
  return response.json();
}

export async function triggerScraper() {
  const response = await fetch(`${API_BASE}/scraper/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to trigger scraper');
  return response.json();
}

export async function cancelScraper() {
  const response = await fetch(`${API_BASE}/scraper/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to cancel scraper');
  return response.json();
}

// ========== Team (stubs - not implemented in backend) ==========
export async function getTeamMembers() {
  console.warn('Team members endpoint not implemented');
  return [];
}

export async function assignTrend(trendId, userId) {
  console.warn('Assign trend endpoint not implemented');
  return null;
}

export async function unassignTrend(trendId, userId) {
  console.warn('Unassign trend endpoint not implemented');
  return null;
}

// ========== Sources ==========
export async function getSources() {
  const response = await fetch(`${API_BASE}/sources`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch sources');
  return response.json();
}
