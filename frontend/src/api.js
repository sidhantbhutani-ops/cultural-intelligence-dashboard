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

export const getTrends = async (params = {}) => {
  const response = await api('/trends');
  return Array.isArray(response) ? response : response.data || [];
};
