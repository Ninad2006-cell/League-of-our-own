const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('cdms_auth_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.post('/api/auth/login', { email, password });
    
    // Store token and user data
    if (response.access_token) {
      localStorage.setItem('cdms_auth_token', response.access_token);
      localStorage.setItem('cdms_auth_user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(name, email, password, role = 'user') {
    const response = await this.post('/api/auth/register', {
      name,
      email,
      password,
      role,
    });
    
    // Store token and user data
    if (response.access_token) {
      localStorage.setItem('cdms_auth_token', response.access_token);
      localStorage.setItem('cdms_auth_user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  logout() {
    localStorage.removeItem('cdms_auth_token');
    localStorage.removeItem('cdms_auth_user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('cdms_auth_token');
  }

  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('cdms_auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const api = {
  // Authentication & Session
  auth: {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    register: (name, email, password, role = 'user') => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    }),
    getMe: () => request('/auth/me')
  },

  // Tournaments & Standings
  tournaments: {
    getAll: () => request('/tournaments'),
    getById: (id) => request(`/tournaments/${id}`),
    getFixtures: (id, status) => {
      const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
      return request(`/tournaments/${id}/fixtures${query}`);
    },
    getStandings: (id) => request(`/tournaments/${id}/standings`)
  },

  // Teams & Squads
  teams: {
    getAll: () => request('/teams'),
    getById: (id) => request(`/teams/${id}`)
  },

  // Players & Profiles
  players: {
    getAll: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.search) sp.append('search', params.search);
      if (params.role && params.role !== 'all') sp.append('role', params.role);
      if (params.teamId) sp.append('team_id', params.teamId);
      const query = sp.toString() ? `?${sp.toString()}` : '';
      return request(`/players${query}`);
    },
    getById: (id) => request(`/players/${id}`)
  },

  // Matches & Live Scorecard
  matches: {
    getAll: (status) => {
      const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
      return request(`/matches${query}`);
    },
    getById: (id) => request(`/matches/${id}`),
    getLive: (id) => request(`/matches/${id}/live`),
    getCommentary: (id) => request(`/matches/${id}/commentary`)
  },

  // Real-World Cricket Live Scores (CricketData.org)
  liveScores: {
    get: (mode = 'live', forceRefresh = false) => {
      const sp = new URLSearchParams();
      if (mode) sp.append('mode', mode);
      if (forceRefresh) sp.append('force_refresh', 'true');
      return request(`/live-scores?${sp.toString()}`);
    }
  },

  // Scorer Operations
  scoring: {
    startMatch: (id, data) => request(`/scoring/matches/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    recordBall: (id, data) => request(`/scoring/matches/${id}/ball`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    undoBall: (id) => request(`/scoring/matches/${id}/undo`, {
      method: 'POST'
    }),
    endInnings: (id, data = {}) => request(`/scoring/matches/${id}/end-innings`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    completeMatch: (id, data) => request(`/scoring/matches/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Admin Management
  admin: {
    createTournament: (data) => request('/admin/tournaments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    createTeam: (data) => request('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    createPlayer: (data) => request('/admin/players', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    createMatch: (data) => request('/admin/matches', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getScorers: () => request('/admin/scorers'),
    updateUserRole: (userId, role) => request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
  }
};

export default api;
