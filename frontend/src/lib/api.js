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

export const api = new ApiClient();
export default api;
