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
  return { token: 'mock-jwt-token-' + Date.now() };
};

export const getTrends = async (params = {}) => {
  return {
    trends: [
      {
        id: '1',
        title: 'Gen Z Sneaker Collecting Obsession',
        description: 'The youngest generation is driving record demand for limited-edition sneakers, fueling a multi-billion dollar resale market.',
        source: 'Variety',
        source_url: 'https://variety.com',
        category: 'Fashion',
        velocity: 'Peaking',
        engagement_metric: 24500,
        angles: ['Sustainability in fashion', 'Gen Z values vs previous gen', 'Resale market growth'],
        picked_up: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'AI-Generated Beauty Filters Ethics',
        description: 'New conversations emerging about the ethics of AI beauty filters on social media platforms.',
        source: 'Wired',
        source_url: 'https://wired.com',
        category: 'Beauty',
        velocity: 'Emerging',
        engagement_metric: 12300,
        angles: ['Digital wellness', 'Self-esteem concerns'],
        picked_up: true,
        picked_up_by: 'Afreen',
        created_at: new Date().toISOString(),
      },
    ]
  };
};

export const getTrend = async (id) => api(`/trends/${id}`);

export const addComment = async (trendId, content) => ({
  success: true,
  comment: { id: Date.now(), content, user_id: 'Demo User', created_at: new Date().toISOString() }
});

export const getComments = async (trendId) => ({
  comments: [
    {
      id: '1',
      content: 'This is perfect for our next piece',
      user_id: 'Afreen',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    }
  ]
});

export const deleteComment = async (trendId, commentId) => ({ success: true });

export const addTag = async (trendId, tag) => ({ success: true });

export const deleteTag = async (trendId, tag) => ({ success: true });

export const markPickedUp = async (trendId) => ({ success: true });

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
