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

  const data = await response.json();
  return data;
};

export const getTrends = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/trends?${queryString}` : '/trends';
  const response = await api(endpoint);
  return response.data;
};

export const getTrend = async (id) => {
  const response = await api(`/trends/${id}`);
  return response.data;
};

export const addComment = async (trendId, content) => {
  const response = await api(`/trends/${trendId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return response.data;
};

export const getComments = async (trendId) => {
  const response = await api(`/trends/${trendId}/comments`);
  return response.data;
};

export const deleteComment = async (trendId, commentId) => {
  const response = await api(`/trends/${trendId}/comments/${commentId}`, {
    method: 'DELETE',
  });
  return response.data;
};

export const addTag = async (trendId, tag) => {
  const response = await api(`/trends/${trendId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tag }),
  });
  return response.data;
};

export const deleteTag = async (trendId, tag) => {
  const response = await api(`/trends/${trendId}/tags/${tag}`, {
    method: 'DELETE',
  });
  return response.data;
};

export const markPickedUp = async (trendId) => {
  const response = await api(`/trends/${trendId}/mark-picked-up`, {
    method: 'POST',
  });
  return response.data;
};

export const getScraperStatus = async () => {
  const response = await api('/scraper/status');
  return response.data;
};

export const triggerScraper = async () => {
  const response = await api('/scraper/run', {
    method: 'POST',
  });
  return response.data;
};

export const getSources = async () => {
  const response = await api('/admin/sources');
  return response.data;
};

export const addSource = async (source) => {
  const response = await api('/admin/sources', {
    method: 'POST',
    body: JSON.stringify(source),
  });
  return response.data;
};

export const updateSource = async (id, source) => {
  const response = await api(`/admin/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(source),
  });
  return response.data;
};

export const deleteSource = async (id) => {
  const response = await api(`/admin/sources/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};

export const testSource = async (id) => {
  const response = await api(`/admin/sources/${id}/test`, {
    method: 'POST',
  });
  return response.data;
};
