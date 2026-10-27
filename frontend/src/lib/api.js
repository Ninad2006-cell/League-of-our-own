/**
 * CDMS Centralized API Client
 * Connects frontend views to FastAPI backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach stored auth token if present
  try {
    const storedUser = localStorage.getItem('cdms_auth_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // ignore json parse errors
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return response.json();
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
