const API_BASE = import.meta.env.VITE_API_URL || 'https://cultural-intelligence-dashboard.onrender.com/api';

export const getToken = () => localStorage.getItem('auth_token');

export const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return await response.json();
};

export const getTrends = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/trends?${queryString}` : '/trends';
  return api(endpoint);
};

export const getTrend = async (id) => api(`/trends/${id}`);

export const addComment = async (trendId, content) => api(`/trends/${trendId}/comments`, {
  method: 'POST',
  body: JSON.stringify({ content }),
});

export const getComments = async (trendId) => api(`/trends/${trendId}/comments`);

export const deleteComment = async (trendId, commentId) => api(`/trends/${trendId}/comments/${commentId}`, {
  method: 'DELETE',
});

export const addTag = async (trendId, tag) => api(`/trends/${trendId}/tags`, {
  method: 'POST',
  body: JSON.stringify({ tag }),
});

export const deleteTag = async (trendId, tag) => api(`/trends/${trendId}/tags/${encodeURIComponent(tag)}`, {
  method: 'DELETE',
});

export const markPickedUp = async (trendId) => api(`/trends/${trendId}/mark-picked-up`, {
  method: 'POST',
});

export const getScraperStatus = async () => api('/scraper/status');

export const triggerScraper = async () => api('/scraper/run', {
  method: 'POST',
});

export const getSources = async () => api('/admin/sources');

export const addSource = async (source) => api('/admin/sources', {
  method: 'POST',
  body: JSON.stringify(source),
});

export const updateSource = async (sourceId, source) => api(`/admin/sources/${sourceId}`, {
  method: 'PUT',
  body: JSON.stringify(source),
});

export const deleteSource = async (sourceId) => api(`/admin/sources/${sourceId}`, {
  method: 'DELETE',
});

export const testSource = async (sourceId) => api(`/admin/sources/${sourceId}/test`, {
  method: 'POST',
});
